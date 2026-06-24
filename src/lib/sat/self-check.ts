import { solveSat } from "./dpll-solver";
import type { Clause, Formula, IngredientId } from "./types";

/**
 * Validaciones manuales del solver DPLL.
 *
 * El proyecto no incluye un framework de tests (Jest/Vitest), por lo que estas
 * comprobaciones se exponen como una función pura que puede ejecutarse en
 * desarrollo (por ejemplo desde la consola del navegador o un endpoint dev):
 *
 *   import { runSatSelfCheck } from "@/lib/sat/self-check";
 *   console.table(runSatSelfCheck());
 */

let n = 0;
function p(variable: IngredientId): { variable: IngredientId; negated: boolean } {
  return { variable, negated: false };
}
function np(variable: IngredientId): { variable: IngredientId; negated: boolean } {
  return { variable, negated: true };
}
function c(...literals: { variable: IngredientId; negated: boolean }[]): Clause {
  n += 1;
  return { id: `check-${n}`, literals };
}

export type SelfCheckCase = {
  name: string;
  passed: boolean;
  expectedSat: boolean;
  actualSat: boolean;
  detail: string;
};

export function runSatSelfCheck(): SelfCheckCase[] {
  const cases: SelfCheckCase[] = [];

  const check = (name: string, formula: Formula, expectedSat: boolean): void => {
    const result = solveSat(formula);
    cases.push({
      name,
      expectedSat,
      actualSat: result.satisfiable,
      passed: result.satisfiable === expectedSat,
      detail: result.satisfiable
        ? `decisiones=${result.stats.decisions}, unit=${result.stats.unitPropagations}, puros=${result.stats.pureLiteralEliminations}`
        : "sin solución",
    });
  };

  // 1. Fórmula satisfacible simple.
  check("satisfacible simple (Tomate ∨ Queso)", [c(p("tomato"), p("cheese"))], true);

  // 2. Insatisfacible: (A) ∧ (¬A).
  check("insatisfacible (Tomate) ∧ (¬Tomate)", [c(p("tomato")), c(np("tomato"))], false);

  // 3. Unit propagation: (A) ∧ (¬A ∨ B) ⇒ fuerza A=true, luego B=true.
  check(
    "unit propagation (Tomate) ∧ (¬Tomate ∨ Queso)",
    [c(p("tomato")), c(np("tomato"), p("cheese"))],
    true
  );

  // 4. Pure literal: 'basil' solo aparece positivo ⇒ se asigna por literal puro.
  check(
    "literal puro (Albahaca ∨ Queso) ∧ (Albahaca ∨ ¬Cebolla)",
    [c(p("basil"), p("cheese")), c(p("basil"), np("onion"))],
    true
  );

  // 5. Fórmula vacía: satisfacible.
  check("fórmula vacía", [], true);

  // 6. Cláusula vacía: insatisfacible.
  check("cláusula vacía", [c()], false);

  return cases;
}
