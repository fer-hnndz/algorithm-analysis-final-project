import { ALL_INGREDIENT_IDS } from "./ingredients";
import type {
  Assignment,
  Clause,
  Formula,
  IngredientId,
  Literal,
  SolverResult,
  SolverStats,
} from "./types";

/**
 * Solver SAT exacto basado en DPLL (Davis–Putnam–Logemann–Loveland).
 *
 * SAT es NP-completo: no se conoce un algoritmo polinomial exacto. En el peor
 * caso, para n variables y m cláusulas, el espacio de búsqueda es O(2^n) y cada
 * verificación cuesta O(m), de modo que el peor caso es O(2^n * m). DPLL no
 * cambia esa cota teórica, pero en la práctica reduce el árbol de búsqueda con:
 *   1. Propagación unitaria (unit propagation).
 *   2. Eliminación de literales puros (pure literal elimination).
 *   3. Una heurística de selección de variable (la más frecuente).
 *
 * Todas las funciones son PURAS: no mutan las cláusulas ni la asignación que
 * reciben (las copian), por lo que es seguro usarlas fuera de React.
 */

/** Contador interno de estadísticas (mutable solo dentro de una llamada a solveSat). */
type Counters = {
  decisions: number;
  recursiveCalls: number;
  unitPropagations: number;
  pureLiteralEliminations: number;
};

/** Valor de un literal bajo la asignación actual: true/false/undefined (sin asignar). */
function literalValue(literal: Literal, assignment: Assignment): boolean | undefined {
  const value = assignment[literal.variable];
  if (value === undefined) return undefined;
  return literal.negated ? !value : value;
}

/**
 * Estado de una cláusula bajo la asignación actual.
 * - satisfied: algún literal ya es verdadero (OR cumplido).
 * - unassigned: literales todavía sin valor.
 */
function getClauseState(
  clause: Clause,
  assignment: Assignment
): { satisfied: boolean; unassigned: Literal[] } {
  let satisfied = false;
  const unassigned: Literal[] = [];
  for (const literal of clause.literals) {
    const value = literalValue(literal, assignment);
    if (value === true) {
      satisfied = true;
    } else if (value === undefined) {
      unassigned.push(literal);
    }
  }
  return { satisfied, unassigned };
}

function isClauseSatisfied(clause: Clause, assignment: Assignment): boolean {
  return clause.literals.some((lit) => literalValue(lit, assignment) === true);
}

function describeLiteral(literal: Literal): string {
  return `${literal.negated ? "NOT " : ""}${literal.variable}`;
}

/**
 * Aplica propagación unitaria y eliminación de literales puros hasta el punto
 * fijo. Devuelve una asignación extendida o señala un conflicto (cláusula que
 * no puede satisfacerse). No muta la asignación de entrada.
 */
function propagate(
  clauses: Formula,
  baseAssignment: Assignment,
  counters: Counters,
  trace: string[]
): { assignment: Assignment; conflict: boolean } {
  let assignment: Assignment = { ...baseAssignment };
  let changed = true;

  while (changed) {
    changed = false;

    // --- Unit propagation ---------------------------------------------------
    // Si una cláusula no está satisfecha y le queda un único literal sin
    // asignar, ese literal DEBE ser verdadero para que la cláusula pueda
    // cumplirse. Si no le queda ninguno, hay conflicto.
    for (const clause of clauses) {
      const { satisfied, unassigned } = getClauseState(clause, assignment);
      if (satisfied) continue;
      if (unassigned.length === 0) {
        return { assignment, conflict: true };
      }
      if (unassigned.length === 1) {
        const literal = unassigned[0];
        const value = !literal.negated; // hace que el literal sea verdadero
        assignment = { ...assignment, [literal.variable]: value };
        counters.unitPropagations += 1;
        trace.push(
          `Propagación unitaria: ${describeLiteral(literal)} obliga a ${literal.variable} = ${value ? "Sí" : "No"}`
        );
        changed = true;
      }
    }
    if (changed) continue; // re-evaluar unit propagation antes de literales puros

    // --- Pure literal elimination ------------------------------------------
    // Si una variable sin asignar aparece con una sola polaridad en las
    // cláusulas no satisfechas, asignarla para satisfacer todas esas cláusulas
    // nunca puede empeorar la situación.
    const polarity = new Map<IngredientId, { pos: boolean; neg: boolean }>();
    for (const clause of clauses) {
      if (isClauseSatisfied(clause, assignment)) continue;
      for (const literal of clause.literals) {
        if (assignment[literal.variable] !== undefined) continue;
        const entry = polarity.get(literal.variable) ?? { pos: false, neg: false };
        if (literal.negated) entry.neg = true;
        else entry.pos = true;
        polarity.set(literal.variable, entry);
      }
    }
    for (const [variable, { pos, neg }] of polarity) {
      if (pos !== neg) {
        const value = pos; // solo positiva -> true; solo negada -> false
        assignment = { ...assignment, [variable]: value };
        counters.pureLiteralEliminations += 1;
        trace.push(
          `Literal puro: ${variable} solo aparece ${pos ? "positivo" : "negado"} → ${variable} = ${value ? "Sí" : "No"}`
        );
        changed = true;
      }
    }
  }

  return { assignment, conflict: false };
}

/**
 * Heurística de selección de variable: elige la variable sin asignar que más
 * aparece en las cláusulas todavía no satisfechas, y el valor inicial según su
 * polaridad más frecuente.
 */
function chooseVariable(
  clauses: Formula,
  assignment: Assignment
): { variable: IngredientId; value: boolean } | null {
  const counts = new Map<IngredientId, { count: number; pos: number; neg: number }>();
  for (const clause of clauses) {
    const { satisfied, unassigned } = getClauseState(clause, assignment);
    if (satisfied) continue;
    for (const literal of unassigned) {
      const entry = counts.get(literal.variable) ?? { count: 0, pos: 0, neg: 0 };
      entry.count += 1;
      if (literal.negated) entry.neg += 1;
      else entry.pos += 1;
      counts.set(literal.variable, entry);
    }
  }

  let best: IngredientId | null = null;
  let bestCount = -1;
  for (const [variable, entry] of counts) {
    if (entry.count > bestCount) {
      bestCount = entry.count;
      best = variable;
    }
  }
  if (best === null) return null;

  const entry = counts.get(best)!;
  // Preferir la polaridad más frecuente para esa variable.
  const value = entry.pos >= entry.neg;
  return { variable: best, value };
}

/**
 * Núcleo recursivo de DPLL. Devuelve una asignación que satisface la fórmula o
 * null si la rama no tiene solución (backtracking).
 */
function dpll(
  clauses: Formula,
  baseAssignment: Assignment,
  counters: Counters,
  trace: string[],
  depth: number
): Assignment | null {
  counters.recursiveCalls += 1;

  const { assignment, conflict } = propagate(clauses, baseAssignment, counters, trace);
  if (conflict) {
    trace.push(`${"  ".repeat(depth)}Conflicto: una cláusula no puede satisfacerse`);
    return null;
  }

  // Si todas las cláusulas están satisfechas, encontramos una receta válida.
  if (clauses.every((clause) => isClauseSatisfied(clause, assignment))) {
    return assignment;
  }

  const choice = chooseVariable(clauses, assignment);
  if (choice === null) {
    // No quedan variables para decidir pero aún hay cláusulas sin satisfacer.
    return null;
  }

  const { variable, value } = choice;

  // Probar el valor elegido por la heurística.
  counters.decisions += 1;
  trace.push(`${"  ".repeat(depth)}Decisión: ${variable} = ${value ? "Sí" : "No"}`);
  const first = dpll(
    clauses,
    { ...assignment, [variable]: value },
    counters,
    trace,
    depth + 1
  );
  if (first !== null) return first;

  // Backtracking: probar el valor contrario.
  trace.push(`${"  ".repeat(depth)}Backtrack: ${variable} = ${!value ? "Sí" : "No"}`);
  return dpll(
    clauses,
    { ...assignment, [variable]: !value },
    counters,
    trace,
    depth + 1
  );
}

/** Recolecta las variables (ingredientes) que aparecen en la fórmula. */
function collectVariables(clauses: Formula): Set<IngredientId> {
  const set = new Set<IngredientId>();
  for (const clause of clauses) {
    for (const literal of clause.literals) {
      set.add(literal.variable);
    }
  }
  return set;
}

/**
 * Resuelve una fórmula SAT en FNC con DPLL.
 *
 * Casos borde:
 *  - Fórmula vacía (sin cláusulas): SATISFACIBLE (no hay nada que violar).
 *  - Cláusula vacía (sin literales): INSATISFACIBLE (no puede cumplirse).
 *
 * @param clauses fórmula en forma normal conjuntiva.
 * @returns resultado con asignación completa (false por defecto), estadísticas y trace.
 */
export function solveSat(clauses: Formula): SolverResult {
  const variables = collectVariables(clauses);
  const counters: Counters = {
    decisions: 0,
    recursiveCalls: 0,
    unitPropagations: 0,
    pureLiteralEliminations: 0,
  };
  const trace: string[] = [];

  const start =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const found = dpll(clauses, {}, counters, trace, 0);
  const end = typeof performance !== "undefined" ? performance.now() : Date.now();

  const stats: SolverStats = {
    variables: variables.size,
    clauses: clauses.length,
    decisions: counters.decisions,
    recursiveCalls: counters.recursiveCalls,
    unitPropagations: counters.unitPropagations,
    pureLiteralEliminations: counters.pureLiteralEliminations,
    elapsedMs: Math.max(0, end - start),
  };

  if (found === null) {
    return { satisfiable: false, assignment: null, stats, trace };
  }

  // Completar la asignación: las variables no necesarias quedan en false.
  const assignment = {} as Record<IngredientId, boolean>;
  for (const id of ALL_INGREDIENT_IDS) {
    assignment[id] = found[id] ?? false;
  }

  return { satisfiable: true, assignment, stats, trace };
}

/**
 * Evalúa qué cláusulas quedan satisfechas con una asignación dada.
 * Útil para la UI (mostrar reglas cumplidas). Función pura.
 */
export function evaluateClauses(
  clauses: Formula,
  assignment: Record<IngredientId, boolean>
): { clause: Clause; satisfied: boolean }[] {
  return clauses.map((clause) => ({
    clause,
    satisfied: isClauseSatisfied(clause, assignment),
  }));
}
