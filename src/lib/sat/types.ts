/**
 * Tipos base para la experiencia SAT "La Sopa Perfecta de Linguini".
 *
 * Mapeo conceptual (SAT ⇄ cocina):
 *  - IngredientId  = variable booleana (ingrediente encendido/apagado).
 *  - Literal       = ingrediente, posiblemente negado (NOT).
 *  - Clause        = regla de la sopa: un OR de literales.
 *  - Formula       = todas las reglas combinadas con AND (forma normal conjuntiva).
 *  - Assignment    = qué ingredientes están activados.
 */

export type IngredientId =
  | "tomato"
  | "cheese"
  | "onion"
  | "mushroom"
  | "basil"
  | "pepper"
  | "garlic"
  | "butter";

export type Ingredient = {
  id: IngredientId;
  name: string;
  imagePath: string;
  emoji: string;
};

/** Un literal: un ingrediente que puede estar negado (NOT). */
export type Literal = {
  variable: IngredientId;
  negated: boolean;
};

/** Una cláusula: OR de 1 a 3 literales. */
export type Clause = {
  id: string;
  literals: Literal[];
};

/** Fórmula en FNC: AND de cláusulas. */
export type Formula = Clause[];

/** Asignación parcial de verdad para los ingredientes. */
export type Assignment = Partial<Record<IngredientId, boolean>>;

/** Método de resolución SAT disponible en la interfaz. */
export type SolverMethod =
  | "community-dpll"
  | "student-dpll"
  | "plain-search";

export type SolverOption = {
  id: SolverMethod;
  title: string;
  shortTitle: string;
  description: string;
};

/** Estadísticas del proceso del solver DPLL. */
export type SolverStats = {
  variables: number;
  clauses: number;
  decisions: number;
  recursiveCalls: number;
  unitPropagations: number;
  pureLiteralEliminations: number;
  elapsedMs: number;
};

export type SolverResult = {
  satisfiable: boolean;
  assignment: Record<IngredientId, boolean> | null;
  stats: SolverStats;
  trace: string[];
};
