# SAT — "La Sopa Perfecta de Linguini"

Mini-módulo educativo que resuelve **satisfacibilidad booleana (SAT)** en forma
normal conjuntiva (FNC) con el algoritmo **DPLL**, presentado con temática
Ratatouille. Ruta de la página: `/sat` (`src/app/sat/page.tsx`).

## Mapeo: cocina ⇄ SAT

| Cocina                         | SAT                                  |
| ------------------------------ | ------------------------------------ |
| Ingrediente (encendido/apagado)| Variable booleana                    |
| Ingrediente o `NOT` ingrediente| Literal                              |
| Regla de la sopa               | Cláusula (OR de literales)           |
| Todas las reglas juntas        | Fórmula en FNC (AND de cláusulas)    |
| Receta válida                  | Asignación que satisface la fórmula  |

**Ingredientes (variables):** 🍅 Tomate, 🧀 Queso, 🧅 Cebolla, 🍄 Champiñón,
🌿 Albahaca, 🌶️ Picante, 🧄 Ajo, 🧈 Mantequilla.

Cada **cláusula** es un OR: la regla se cumple si al menos un literal es
verdadero. La **fórmula** es un AND de cláusulas: hay receta perfecta solo si
**todas** las reglas se cumplen a la vez.

## Cómo funciona DPLL

Búsqueda con backtracking + simplificación. Por cada llamada:

1. **Propagación unitaria:** si una cláusula no satisfecha queda con un único
   literal sin asignar, ese literal se fuerza a verdadero. Si queda con cero,
   hay conflicto.
2. **Eliminación de literales puros:** si una variable solo aparece con una
   polaridad en las cláusulas no satisfechas, se asigna para satisfacerlas.
3. **Heurística + backtracking:** se elige la variable más frecuente en las
   cláusulas no satisfechas (con la polaridad más frecuente como valor inicial),
   se prueba un valor y, si falla, el contrario.

Casos borde: la **fórmula vacía** es satisfacible; una **cláusula vacía** es
insatisfacible.

## Complejidad

SAT es **NP-completo**: no se conoce un algoritmo polinomial exacto. En el peor
caso, para `n` variables y `m` cláusulas, el costo es **O(2ⁿ · m)**. DPLL no
cambia esa cota teórica, pero la propagación unitaria, los literales puros y la
heurística reducen el árbol de búsqueda en la práctica.

## Archivos

- `types.ts` — tipos (`IngredientId`, `Literal`, `Clause`, `SolverResult`, …).
- `ingredients.ts` — catálogo de ingredientes (variables).
- `dpll-solver.ts` — solver puro: `solveSat(clauses)` y `evaluateClauses(...)`.
- `examples.ts` — ejemplos precargados (fácil SAT, difícil SAT, UNSAT).
- `self-check.ts` — `runSatSelfCheck()` con validaciones manuales.
- `../../components/sat/*` — UI React (intro, paneles, resultado, explicación).

El solver es independiente de React y no muta su entrada.

## Validación rápida (sin framework de tests)

No hay Jest/Vitest en el proyecto. Para validar el solver en desarrollo:

```ts
import { runSatSelfCheck } from "@/lib/sat/self-check";
console.table(runSatSelfCheck());
```

Cubre: SAT simple, UNSAT `(A) ∧ (¬A)`, unit propagation, literal puro, fórmula
vacía (SAT) y cláusula vacía (UNSAT).

## Script de experimentación (informe)

`scripts/sat_experiments.py` reimplementa DPLL en Python puro (sin librerías
externas de SAT), corre casos de distinto tamaño, mide tiempo y cuenta
decisiones/llamadas/propagaciones, imprime una tabla y guarda
`reports/sat_experiments.csv`.

```bash
python scripts/sat_experiments.py
```
