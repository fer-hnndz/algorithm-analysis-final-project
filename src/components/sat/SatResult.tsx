"use client";

import { Ban, Check, Soup, X } from "lucide-react";
import { INGREDIENTS, getIngredient } from "@/lib/sat/ingredients";
import type { Clause, SolverResult } from "@/lib/sat/types";

type SatResultProps = {
  result: SolverResult;
  clauses: Clause[];
  /** Estado de satisfacción por id de cláusula. */
  satisfiedById: Record<string, boolean>;
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-amber-200/15 bg-white/5 px-3 py-3 text-center">
      <div className="text-2xl font-black text-amber-100 sm:text-3xl">{value}</div>
      <div className="mt-0.5 text-[11px] font-medium leading-tight text-amber-100/55">
        {label}
      </div>
    </div>
  );
}

/**
 * Resultado del solver: indica si existe receta perfecta, muestra la asignación
 * (ingredientes Sí/No), las cláusulas satisfechas y las estadísticas de DPLL.
 */
export function SatResult({ result, clauses, satisfiedById }: SatResultProps) {
  const { satisfiable, assignment, stats } = result;

  return (
    <section
      className={[
        "sat-panel sat-pop-in overflow-hidden p-6",
        satisfiable
          ? "border-emerald-400/40 shadow-[0_0_50px_-18px_rgba(16,185,129,0.7)]"
          : "border-red-400/40 shadow-[0_0_50px_-18px_rgba(239,68,68,0.7)]",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <span
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            satisfiable
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-red-500/20 text-red-300",
          ].join(" ")}
          aria-hidden
        >
          {satisfiable ? (
            <Soup className="h-6 w-6" />
          ) : (
            <Ban className="h-6 w-6" />
          )}
        </span>
        <div>
          <h2
            className={[
              "text-2xl font-black sm:text-3xl",
              satisfiable ? "text-emerald-300" : "text-red-300",
            ].join(" ")}
          >
            {satisfiable
              ? "Sí existe receta perfecta"
              : "No existe receta perfecta"}
          </h2>
          <p className="mt-1 text-sm text-amber-100/75">
            {satisfiable
              ? "Esta asignación de ingredientes satisface todas las reglas al mismo tiempo."
              : "Ninguna combinación de ingredientes satisface todas las reglas."}
          </p>
        </div>
      </div>

      {satisfiable && assignment ? (
        <>
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-200/70">
              Asignación encontrada
            </h3>
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {INGREDIENTS.map((ingredient) => {
                const on = assignment[ingredient.id];
                return (
                  <li
                    key={ingredient.id}
                    className={[
                      "flex items-center gap-2 rounded-2xl border p-2.5 text-sm",
                      on
                        ? "border-emerald-400/50 bg-emerald-500/15 font-bold text-emerald-100"
                        : "border-white/10 bg-white/5 text-amber-100/45",
                    ].join(" ")}
                  >
                    <span className="text-lg" aria-hidden>
                      {ingredient.emoji}
                    </span>
                    <span className="flex-1 truncate">{ingredient.name}</span>
                    <span className="text-xs font-extrabold">
                      {on ? "Sí" : "No"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-200/70">
              Reglas satisfechas
            </h3>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {clauses.map((clause, index) => (
                <li
                  key={clause.id}
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 text-sm text-amber-100/80"
                >
                  {satisfiedById[clause.id] ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-red-400" aria-hidden />
                  )}
                  <span className="truncate">
                    Regla {index + 1}: (
                    {clause.literals
                      .map(
                        (l) =>
                          `${l.negated ? "NOT " : ""}${getIngredient(l.variable).name}`
                      )
                      .join(" OR ")}
                    )
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100/90">
          <p className="font-semibold">Sugerencia</p>
          <p className="mt-1 text-red-100/70">
            Prueba quitar una regla contradictoria o cargar otro ejemplo.
          </p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-200/70">
          Estadísticas del algoritmo
        </h3>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          <StatCard label="Variables" value={stats.variables} />
          <StatCard label="Cláusulas" value={stats.clauses} />
          <StatCard label="Decisiones" value={stats.decisions} />
          <StatCard label="Llamadas recursivas" value={stats.recursiveCalls} />
          <StatCard label="Prop. unitarias" value={stats.unitPropagations} />
          <StatCard label="Literales puros" value={stats.pureLiteralEliminations} />
          <StatCard label="Tiempo (ms)" value={stats.elapsedMs.toFixed(2)} />
        </div>
      </div>
    </section>
  );
}
