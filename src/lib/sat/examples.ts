import type { Clause, Formula, IngredientId, Literal } from "./types";

/** Atajo para construir un literal positivo. */
function pos(variable: IngredientId): Literal {
  return { variable, negated: false };
}

/** Atajo para construir un literal negado (NOT ingrediente). */
function neg(variable: IngredientId): Literal {
  return { variable, negated: true };
}

let clauseCounter = 0;

/** Construye una cláusula con id único a partir de sus literales. */
function clause(...literals: Literal[]): Clause {
  clauseCounter += 1;
  return { id: `clause-${clauseCounter}`, literals };
}

export type SatExample = {
  id: string;
  title: string;
  description: string;
  formula: Formula;
};

/**
 * Catálogo de ejemplos precargados. Cada fórmula está en FNC: las cláusulas se
 * combinan con AND, los literales dentro de cada cláusula con OR.
 */
export const SAT_EXAMPLES: readonly SatExample[] = [
  {
    id: "easy-sat",
    title: "Ejemplo fácil (con solución)",
    description: "Pocas reglas, fáciles de cumplir todas a la vez.",
    // (Tomate ∨ Albahaca ∨ Queso) ∧ (¬Cebolla ∨ ¬Champiñón ∨ Ajo)
    // ∧ (¬Picante ∨ Queso) ∧ (Ajo ∨ Mantequilla ∨ Albahaca)
    formula: [
      clause(pos("tomato"), pos("basil"), pos("cheese")),
      clause(neg("onion"), neg("mushroom"), pos("garlic")),
      clause(neg("pepper"), pos("cheese")),
      clause(pos("garlic"), pos("butter"), pos("basil")),
    ],
  },
  {
    id: "hard-sat",
    title: "Ejemplo difícil (con solución)",
    description: "Más reglas e interdependencias; DPLL trabaja más.",
    // 8 cláusulas con varias negaciones e interacciones.
    formula: [
      clause(pos("tomato"), pos("cheese"), pos("basil")),
      clause(neg("tomato"), pos("garlic"), pos("butter")),
      clause(neg("cheese"), neg("pepper"), pos("basil")),
      clause(pos("onion"), pos("mushroom"), neg("garlic")),
      clause(neg("onion"), neg("mushroom"), pos("butter")),
      clause(pos("pepper"), neg("butter"), pos("cheese")),
      clause(neg("basil"), pos("tomato"), pos("garlic")),
      clause(neg("pepper"), neg("onion"), pos("cheese")),
    ],
  },
  {
    id: "unsat",
    title: "Ejemplo sin solución",
    description: "Reglas contradictorias: no existe receta posible.",
    // (Tomate) ∧ (¬Tomate) ∧ (Queso ∨ Albahaca) ∧ (¬Queso) ∧ (¬Albahaca)
    formula: [
      clause(pos("tomato")),
      clause(neg("tomato")),
      clause(pos("cheese"), pos("basil")),
      clause(neg("cheese")),
      clause(neg("basil")),
    ],
  },
] as const;

export function getExample(id: string): SatExample | undefined {
  return SAT_EXAMPLES.find((example) => example.id === id);
}
