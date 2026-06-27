import { performance } from "node:perf_hooks";
import { SAT_EXAMPLES } from "../src/lib/sat/examples";
import { solveWithMethod } from "../src/lib/sat/solver-methods";
import type {
  Clause,
  IngredientId,
  Literal,
  SolverMethod,
} from "../src/lib/sat/types";

const ids: IngredientId[] = [
  "tomato",
  "cheese",
  "onion",
  "mushroom",
  "basil",
  "pepper",
  "garlic",
  "butter",
];

const lit = (variable: IngredientId, negated = false): Literal => ({
  variable,
  negated,
});

const clause = (id: string, literals: Literal[]): Clause => ({ id, literals });

const allFalseLate = ids.map((id, i) => clause(`late-${i}`, [lit(id, true)]));

const contradictionAllVars = [
  ...ids.map((id, i) => clause(`taut-${i}`, [lit(id), lit(id, true)])),
  clause("force-tomato", [lit("tomato")]),
  clause("deny-tomato", [lit("tomato", true)]),
];

const cases = [
  {
    name: "Ejemplo fácil SAT",
    formula: SAT_EXAMPLES.find((e) => e.id === "easy-sat")!.formula,
    repeats: 7000,
  },
  {
    name: "Ejemplo difícil SAT",
    formula: SAT_EXAMPLES.find((e) => e.id === "hard-sat")!.formula,
    repeats: 7000,
  },
  {
    name: "Ejemplo sin solución",
    formula: SAT_EXAMPLES.find((e) => e.id === "unsat")!.formula,
    repeats: 7000,
  },
  {
    name: "Única solución tardía (8 vars)",
    formula: allFalseLate,
    repeats: 5000,
  },
  {
    name: "Contradicción con 8 vars",
    formula: contradictionAllVars,
    repeats: 5000,
  },
];

const methods: { id: SolverMethod; label: string }[] = [
  { id: "community-dpll", label: "DPLL aceptado por la comunidad" },
  {
    id: "student-dpll",
    label: "DPLL propio inspirado en la comunidad",
  },
  {
    id: "plain-search",
    label: "Implementación propia sin algoritmo previo",
  },
];

function cloneFormula(formula: readonly Clause[]): Clause[] {
  return formula.map((c) => ({
    id: c.id,
    literals: c.literals.map((l) => ({ ...l })),
  }));
}

console.log(
  "caso|metodo|sat|repeticiones|total_ms|promedio_ms|decisiones|recursivas|unitarias|puros"
);

for (const testCase of cases) {
  for (const method of methods) {
    for (let i = 0; i < 20; i += 1) {
      solveWithMethod(cloneFormula(testCase.formula), method.id);
    }

    const start = performance.now();
    let last = solveWithMethod(cloneFormula(testCase.formula), method.id);
    for (let i = 1; i < testCase.repeats; i += 1) {
      last = solveWithMethod(cloneFormula(testCase.formula), method.id);
    }
    const total = performance.now() - start;

    console.log(
      [
        testCase.name,
        method.label,
        last.satisfiable ? "SAT" : "UNSAT",
        testCase.repeats,
        total.toFixed(3),
        (total / testCase.repeats).toFixed(6),
        last.stats.decisions,
        last.stats.recursiveCalls,
        last.stats.unitPropagations,
        last.stats.pureLiteralEliminations,
      ].join("|")
    );
  }
}
