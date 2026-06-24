"""Experimentos de rendimiento para el solver SAT (DPLL).

Este script reimplementa el MISMO enfoque DPLL que la versión TypeScript del
proyecto (`src/lib/sat/dpll-solver.ts`), pero en Python puro, para generar datos
del informe de Análisis de Algoritmos.

Representación:
  - Variable: entero 1..n.
  - Literal: entero con signo (positivo = variable, negativo = NOT variable).
  - Cláusula: lista de literales (OR).
  - Fórmula: lista de cláusulas (AND)  -> Forma Normal Conjuntiva (FNC).

Complejidad:
  SAT es NP-completo: no se conoce un algoritmo polinomial exacto. En el peor
  caso, para n variables y m cláusulas, el costo es O(2^n * m). DPLL no cambia
  esa cota teórica, pero la propagación unitaria, la eliminación de literales
  puros y la heurística de selección reducen el árbol de búsqueda en la práctica.

NO usa librerías externas de SAT (pycosat, z3, python-sat, etc.): la idea es
demostrar el algoritmo propio. Solo se usa la biblioteca estándar.

Uso:
    python scripts/sat_experiments.py
"""

from __future__ import annotations

import csv
import os
import random
import time
from dataclasses import dataclass

Clause = list[int]
Formula = list[Clause]
Assignment = dict[int, bool]


@dataclass
class Stats:
    decisions: int = 0
    recursive_calls: int = 0
    unit_propagations: int = 0
    pure_literal_eliminations: int = 0


def literal_value(literal: int, assignment: Assignment) -> bool | None:
    """Valor de un literal bajo la asignación: True/False/None (sin asignar)."""
    var = abs(literal)
    if var not in assignment:
        return None
    value = assignment[var]
    return value if literal > 0 else not value


def clause_state(clause: Clause, assignment: Assignment) -> tuple[bool, list[int]]:
    """Devuelve (satisfecha, literales_sin_asignar)."""
    satisfied = False
    unassigned: list[int] = []
    for literal in clause:
        value = literal_value(literal, assignment)
        if value is True:
            satisfied = True
        elif value is None:
            unassigned.append(literal)
    return satisfied, unassigned


def is_satisfied(clause: Clause, assignment: Assignment) -> bool:
    return any(literal_value(lit, assignment) is True for lit in clause)


def propagate(clauses: Formula, base: Assignment, stats: Stats) -> tuple[Assignment, bool]:
    """Propagacion unitaria + eliminacion de literales puros hasta punto fijo.

    Devuelve (asignacion_extendida, conflicto). No muta `base`.
    """
    assignment: Assignment = dict(base)
    changed = True
    while changed:
        changed = False

        # --- Propagacion unitaria ---
        for clause in clauses:
            satisfied, unassigned = clause_state(clause, assignment)
            if satisfied:
                continue
            if len(unassigned) == 0:
                return assignment, True  # conflicto
            if len(unassigned) == 1:
                lit = unassigned[0]
                assignment[abs(lit)] = lit > 0
                stats.unit_propagations += 1
                changed = True
        if changed:
            continue

        # --- Eliminacion de literales puros ---
        polarity: dict[int, set[bool]] = {}
        for clause in clauses:
            if is_satisfied(clause, assignment):
                continue
            for lit in clause:
                var = abs(lit)
                if var in assignment:
                    continue
                polarity.setdefault(var, set()).add(lit > 0)
        for var, signs in polarity.items():
            if len(signs) == 1:
                assignment[var] = next(iter(signs))
                stats.pure_literal_eliminations += 1
                changed = True

    return assignment, False


def choose_variable(clauses: Formula, assignment: Assignment) -> tuple[int, bool] | None:
    """Variable mas frecuente en clausulas no satisfechas + polaridad preferida."""
    count: dict[int, int] = {}
    pos: dict[int, int] = {}
    neg: dict[int, int] = {}
    for clause in clauses:
        satisfied, unassigned = clause_state(clause, assignment)
        if satisfied:
            continue
        for lit in unassigned:
            var = abs(lit)
            count[var] = count.get(var, 0) + 1
            if lit > 0:
                pos[var] = pos.get(var, 0) + 1
            else:
                neg[var] = neg.get(var, 0) + 1

    if not count:
        return None
    best = max(count, key=lambda v: count[v])
    value = pos.get(best, 0) >= neg.get(best, 0)
    return best, value


def dpll(clauses: Formula, base: Assignment, stats: Stats) -> Assignment | None:
    """Nucleo recursivo de DPLL. Devuelve asignacion o None (backtracking)."""
    stats.recursive_calls += 1
    assignment, conflict = propagate(clauses, base, stats)
    if conflict:
        return None
    if all(is_satisfied(clause, assignment) for clause in clauses):
        return assignment

    choice = choose_variable(clauses, assignment)
    if choice is None:
        return None
    var, value = choice

    stats.decisions += 1
    first = dict(assignment)
    first[var] = value
    result = dpll(clauses, first, stats)
    if result is not None:
        return result

    second = dict(assignment)
    second[var] = not value
    return dpll(clauses, second, stats)


def solve(clauses: Formula) -> tuple[bool, Assignment | None, Stats]:
    """Resuelve la formula. Formula vacia -> SAT; clausula vacia -> UNSAT."""
    stats = Stats()
    result = dpll(clauses, {}, stats)
    return (result is not None), result, stats


def random_formula(num_vars: int, num_clauses: int, k: int, seed: int) -> Formula:
    """Genera una formula k-SAT aleatoria (sin literales repetidos por clausula)."""
    rng = random.Random(seed)
    formula: Formula = []
    for _ in range(num_clauses):
        size = min(k, num_vars)
        variables = rng.sample(range(1, num_vars + 1), size)
        clause = [v if rng.random() < 0.5 else -v for v in variables]
        formula.append(clause)
    return formula


@dataclass
class ExperimentRow:
    label: str
    num_vars: int
    num_clauses: int
    k: int
    satisfiable: bool
    decisions: int
    recursive_calls: int
    unit_propagations: int
    pure_literal_eliminations: int
    elapsed_ms: float


def run_experiments() -> list[ExperimentRow]:
    """Ejecuta casos con distinta cantidad de variables y clausulas."""
    # Mezcla de tamanos: la razon clausulas/variables ~4.26 es la mas dificil
    # para 3-SAT (fase de transicion), buena para mostrar el costo exponencial.
    configs = [
        (5, 10, 3),
        (10, 20, 3),
        (15, 40, 3),
        (20, 60, 3),
        (20, 85, 3),
        (25, 106, 3),
        (30, 128, 3),
    ]
    rows: list[ExperimentRow] = []
    for num_vars, num_clauses, k in configs:
        formula = random_formula(num_vars, num_clauses, k, seed=num_vars * 7 + num_clauses)
        start = time.perf_counter()
        satisfiable, _assignment, stats = solve(formula)
        elapsed_ms = (time.perf_counter() - start) * 1000.0
        rows.append(
            ExperimentRow(
                label=f"{k}-SAT n={num_vars} m={num_clauses}",
                num_vars=num_vars,
                num_clauses=num_clauses,
                k=k,
                satisfiable=satisfiable,
                decisions=stats.decisions,
                recursive_calls=stats.recursive_calls,
                unit_propagations=stats.unit_propagations,
                pure_literal_eliminations=stats.pure_literal_eliminations,
                elapsed_ms=elapsed_ms,
            )
        )
    return rows


def print_table(rows: list[ExperimentRow]) -> None:
    header = (
        f"{'Caso':<22}{'vars':>5}{'claus':>7}{'SAT':>5}"
        f"{'dec':>7}{'rec':>8}{'unit':>7}{'puros':>7}{'ms':>10}"
    )
    print(header)
    print("-" * len(header))
    for r in rows:
        print(
            f"{r.label:<22}{r.num_vars:>5}{r.num_clauses:>7}"
            f"{('Si' if r.satisfiable else 'No'):>5}"
            f"{r.decisions:>7}{r.recursive_calls:>8}{r.unit_propagations:>7}"
            f"{r.pure_literal_eliminations:>7}{r.elapsed_ms:>10.3f}"
        )


def save_csv(rows: list[ExperimentRow]) -> str:
    """Guarda resultados en reports/sat_experiments.csv (crea la carpeta si falta)."""
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    reports_dir = os.path.join(project_root, "reports")
    os.makedirs(reports_dir, exist_ok=True)
    csv_path = os.path.join(reports_dir, "sat_experiments.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            [
                "label",
                "num_vars",
                "num_clauses",
                "k",
                "satisfiable",
                "decisions",
                "recursive_calls",
                "unit_propagations",
                "pure_literal_eliminations",
                "elapsed_ms",
            ]
        )
        for r in rows:
            writer.writerow(
                [
                    r.label,
                    r.num_vars,
                    r.num_clauses,
                    r.k,
                    r.satisfiable,
                    r.decisions,
                    r.recursive_calls,
                    r.unit_propagations,
                    r.pure_literal_eliminations,
                    f"{r.elapsed_ms:.3f}",
                ]
            )
    return csv_path


def self_check() -> None:
    """Verificaciones minimas equivalentes a las del solver TypeScript."""
    assert solve([])[0] is True, "formula vacia debe ser SAT"
    assert solve([[]])[0] is False, "clausula vacia debe ser UNSAT"
    assert solve([[1], [-1]])[0] is False, "(A) AND (NOT A) debe ser UNSAT"
    assert solve([[1, 2]])[0] is True, "(A OR B) debe ser SAT"
    assert solve([[1], [-1, 2]])[0] is True, "unit propagation debe ser SAT"
    print("Self-check OK\n")


def main() -> None:
    self_check()
    rows = run_experiments()
    print_table(rows)
    path = save_csv(rows)
    print(f"\nResultados guardados en: {path}")


if __name__ == "__main__":
    main()
