import { ALL_INGREDIENT_IDS } from "./ingredients";
import { solveSat } from "./dpll-solver";
import type {
  Assignment,
  Clause,
  Formula,
  IngredientId,
  Literal,
  SolverMethod,
  SolverOption,
  SolverResult,
  SolverStats,
} from "./types";

export const SOLVER_OPTIONS: readonly SolverOption[] = [
  {
    id: "community-dpll",
    title: "DPLL aceptado",
    shortTitle: "DPLL",
    description:
      "Versión completa con propagación unitaria, literales puros, heurística y backtracking.",
  },
  {
    id: "student-dpll",
    title: "DPLL propio",
    shortTitle: "DPLL propio",
    description:
      "Versión inspirada en DPLL: propaga unitarias, pero elige variables en orden y no usa literales puros.",
  },
  {
    id: "plain-search",
    title: "Intento directo",
    shortTitle: "Búsqueda directa",
    description:
      "Prueba combinaciones de ingredientes una por una sin optimizaciones importantes.",
  },
] as const;

type Counters = {
  decisions: number;
  recursiveCalls: number;
  unitPropagations: number;
  pureLiteralEliminations: number;
};

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function collectVariables(clauses: Formula): IngredientId[] {
  const set = new Set<IngredientId>();
  for (const clause of clauses) {
    for (const literal of clause.literals) set.add(literal.variable);
  }
  return ALL_INGREDIENT_IDS.filter((id) => set.has(id));
}

function completeAssignment(assignment: Assignment): Record<IngredientId, boolean> {
  const completed = {} as Record<IngredientId, boolean>;
  for (const id of ALL_INGREDIENT_IDS) completed[id] = assignment[id] ?? false;
  return completed;
}

function literalValue(
  literal: Literal,
  assignment: Assignment
): boolean | undefined {
  const value = assignment[literal.variable];
  if (value === undefined) return undefined;
  return literal.negated ? !value : value;
}

function isClauseSatisfied(clause: Clause, assignment: Assignment): boolean {
  return clause.literals.some((literal) => literalValue(literal, assignment) === true);
}

function isClauseContradicted(clause: Clause, assignment: Assignment): boolean {
  return clause.literals.every((literal) => literalValue(literal, assignment) === false);
}

function isFormulaSatisfied(clauses: Formula, assignment: Assignment): boolean {
  return clauses.every((clause) => isClauseSatisfied(clause, assignment));
}

function makeStats(
  clauses: Formula,
  variables: readonly IngredientId[],
  counters: Counters,
  elapsedMs: number
): SolverStats {
  return {
    variables: variables.length,
    clauses: clauses.length,
    decisions: counters.decisions,
    recursiveCalls: counters.recursiveCalls,
    unitPropagations: counters.unitPropagations,
    pureLiteralEliminations: counters.pureLiteralEliminations,
    elapsedMs: Math.max(0, elapsedMs),
  };
}

/**
 * Intento directo de resolver SAT sin apoyarse en DPLL: se generan combinaciones
 * de ingredientes (true/false) y se revisa si alguna satisface todas las reglas.
 *
 * Es correcto, pero no intenta podar el árbol ni simplificar la fórmula. En el
 * peor caso revisa 2^n asignaciones y cada revisión recorre las m cláusulas:
 * O(2^n * m).
 */
export function solvePlainSearch(clauses: Formula): SolverResult {
  const variables = collectVariables(clauses);
  const counters: Counters = {
    decisions: 0,
    recursiveCalls: 0,
    unitPropagations: 0,
    pureLiteralEliminations: 0,
  };
  const trace: string[] = [];
  const start = now();

  const visit = (index: number, assignment: Assignment): Assignment | null => {
    counters.recursiveCalls += 1;
    if (index === variables.length) {
      counters.decisions += 1;
      const ok = isFormulaSatisfied(clauses, assignment);
      trace.push(
        `Prueba ${counters.decisions}: ${ok ? "sirve" : "no sirve"}`
      );
      return ok ? assignment : null;
    }

    const variable = variables[index];
    const withYes = visit(index + 1, { ...assignment, [variable]: true });
    if (withYes) return withYes;
    return visit(index + 1, { ...assignment, [variable]: false });
  };

  const found = visit(0, {});
  const stats = makeStats(clauses, variables, counters, now() - start);
  return found
    ? {
        satisfiable: true,
        assignment: completeAssignment(found),
        stats,
        trace,
      }
    : { satisfiable: false, assignment: null, stats, trace };
}

function propagateUnitClauses(
  clauses: Formula,
  baseAssignment: Assignment,
  counters: Counters,
  trace: string[]
): { assignment: Assignment; conflict: boolean } {
  let assignment: Assignment = { ...baseAssignment };
  let changed = true;

  while (changed) {
    changed = false;
    for (const clause of clauses) {
      if (isClauseSatisfied(clause, assignment)) continue;

      const unassigned = clause.literals.filter(
        (literal) => assignment[literal.variable] === undefined
      );
      if (unassigned.length === 0) return { assignment, conflict: true };

      if (unassigned.length === 1) {
        const literal = unassigned[0];
        const value = !literal.negated;
        assignment = { ...assignment, [literal.variable]: value };
        counters.unitPropagations += 1;
        trace.push(
          `Unitario simple: ${literal.variable} = ${value ? "Sí" : "No"}`
        );
        changed = true;
      }
    }
  }

  return { assignment, conflict: false };
}

function firstUnassignedVariable(
  variables: readonly IngredientId[],
  assignment: Assignment
): IngredientId | null {
  return variables.find((variable) => assignment[variable] === undefined) ?? null;
}

/**
 * Versión simplificada estilo DPLL. Es exacta, pero deliberadamente menos
 * refinada que el DPLL completo:
 * - usa propagación unitaria,
 * - no aplica eliminación de literales puros,
 * - no usa frecuencia/polaridad como heurística,
 * - elige la primera variable libre y prueba true, luego false.
 */
export function solveStudentDpll(clauses: Formula): SolverResult {
  const variables = collectVariables(clauses);
  const counters: Counters = {
    decisions: 0,
    recursiveCalls: 0,
    unitPropagations: 0,
    pureLiteralEliminations: 0,
  };
  const trace: string[] = [];
  const start = now();

  const recurse = (baseAssignment: Assignment, depth: number): Assignment | null => {
    counters.recursiveCalls += 1;
    const { assignment, conflict } = propagateUnitClauses(
      clauses,
      baseAssignment,
      counters,
      trace
    );

    if (conflict || clauses.some((clause) => isClauseContradicted(clause, assignment))) {
      trace.push(`${"  ".repeat(depth)}Conflicto: rama descartada`);
      return null;
    }

    if (isFormulaSatisfied(clauses, assignment)) return assignment;

    const variable = firstUnassignedVariable(variables, assignment);
    if (!variable) return null;

    counters.decisions += 1;
    trace.push(`${"  ".repeat(depth)}Pruebo ${variable} = Sí`);
    const yes = recurse({ ...assignment, [variable]: true }, depth + 1);
    if (yes) return yes;

    trace.push(`${"  ".repeat(depth)}No funcionó; pruebo ${variable} = No`);
    return recurse({ ...assignment, [variable]: false }, depth + 1);
  };

  const found = recurse({}, 0);
  const stats = makeStats(clauses, variables, counters, now() - start);
  return found
    ? {
        satisfiable: true,
        assignment: completeAssignment(found),
        stats,
        trace,
      }
    : { satisfiable: false, assignment: null, stats, trace };
}

export function solveWithMethod(
  clauses: Formula,
  method: SolverMethod
): SolverResult {
  switch (method) {
    case "community-dpll":
      return solveSat(clauses);
    case "student-dpll":
      return solveStudentDpll(clauses);
    case "plain-search":
      return solvePlainSearch(clauses);
  }
}
