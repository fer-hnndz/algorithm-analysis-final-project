"use client";

import { Check, Plus, Soup, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { INGREDIENTS, getIngredient } from "@/lib/sat/ingredients";
import type { Clause, IngredientId, Literal } from "@/lib/sat/types";

const MAX_LITERALS = 3;

type ClauseBuilderProps = {
  clauses: Clause[];
  /** Estado de satisfacción por id de cláusula (tras calcular), si existe. */
  satisfiedById: Record<string, boolean> | null;
  onAddClause: (literals: Literal[]) => void;
  onRemoveClause: (id: string) => void;
  onSound?: () => void;
};

type DraftLiteral = { variable: IngredientId; negated: boolean };

function literalsEqual(a: Literal, b: Literal): boolean {
  return a.variable === b.variable && a.negated === b.negated;
}

/** Chip visual de un literal (ingrediente, posiblemente negado). */
function LiteralChip({ literal }: { literal: Literal }) {
  const ingredient = getIngredient(literal.variable);
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-semibold",
        literal.negated
          ? "border-red-400/50 bg-red-500/15 text-red-200"
          : "border-amber-300/40 bg-amber-300/15 text-amber-100",
      ].join(" ")}
    >
      {literal.negated && <span className="font-black text-red-300">NOT</span>}
      {ingredient.name}
    </span>
  );
}

/** Separador "AND" elegante entre cláusulas. */
function AndDivider() {
  return (
    <div className="flex items-center gap-3 py-1" aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300/30" />
      <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-0.5 text-[11px] font-black tracking-widest text-amber-300">
        AND
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300/30" />
    </div>
  );
}

/**
 * Columna central: muestra las reglas de la sopa (cláusulas) y un constructor
 * para agregar nuevas. Visualiza el OR dentro de cada cláusula y el AND entre
 * cláusulas, dejando claro que la fórmula está en FNC.
 */
export function ClauseBuilder({
  clauses,
  satisfiedById,
  onAddClause,
  onRemoveClause,
  onSound,
}: ClauseBuilderProps) {
  const [draft, setDraft] = useState<DraftLiteral[]>([
    { variable: "tomato", negated: false },
  ]);
  const [warning, setWarning] = useState<string | null>(null);

  const updateLiteral = (index: number, patch: Partial<DraftLiteral>) => {
    setDraft((current) =>
      current.map((lit, i) => (i === index ? { ...lit, ...patch } : lit))
    );
  };

  const addSlot = () => {
    if (draft.length >= MAX_LITERALS) return;
    setDraft((current) => [...current, { variable: "cheese", negated: false }]);
  };

  const removeSlot = (index: number) => {
    setDraft((current) => current.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (draft.length === 0) {
      setWarning("Una cláusula no puede estar vacía.");
      return;
    }
    const literals: Literal[] = [];
    for (const lit of draft) {
      if (literals.some((existing) => literalsEqual(existing, lit))) {
        setWarning("No se permiten literales duplicados en la misma cláusula.");
        return;
      }
      literals.push({ variable: lit.variable, negated: lit.negated });
    }
    setWarning(null);
    onAddClause(literals);
    onSound?.();
    setDraft([{ variable: "tomato", negated: false }]);
  };

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70";

  return (
    <section className="sat-panel flex flex-col p-5 sm:p-6">
      <h2 className="text-2xl font-black sat-title-accent">Reglas de la sopa</h2>
      <p className="mt-1 text-sm leading-relaxed text-amber-100/70">
        Cada regla es una cláusula. Los ingredientes dentro de una regla se unen
        con <span className="font-bold text-amber-200">OR</span>. Todas las
        reglas se deben cumplir con{" "}
        <span className="font-bold text-amber-200">AND</span>.
      </p>

      {clauses.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-300/25 bg-white/5 p-8 text-center">
          <Soup className="h-9 w-9 text-amber-300/60" aria-hidden />
          <p className="text-sm font-medium text-amber-100/70">
            Aún no hay reglas. Cargá un ejemplo o agregá una regla abajo.
          </p>
        </div>
      ) : (
        <ol className="mt-4 space-y-1">
          {clauses.map((clause, index) => {
            const satisfied = satisfiedById?.[clause.id];
            return (
              <li key={clause.id}>
                {index > 0 && <AndDivider />}
                <div
                  className={[
                    "flex items-center gap-3 rounded-2xl border p-3 transition-colors",
                    satisfied === true
                      ? "border-emerald-400/50 bg-emerald-500/12"
                      : satisfied === false
                        ? "border-red-400/50 bg-red-500/12"
                        : "border-amber-200/15 bg-white/5",
                  ].join(" ")}
                >
                  <span className="text-xs font-bold text-amber-200/50">
                    #{index + 1}
                  </span>
                  <div className="flex flex-1 flex-wrap items-center gap-1.5">
                    {clause.literals.map((literal, li) => (
                      <span
                        key={`${clause.id}-${li}`}
                        className="flex items-center gap-1.5"
                      >
                        {li > 0 && (
                          <span className="text-[11px] font-black tracking-wide text-amber-300/70">
                            OR
                          </span>
                        )}
                        <LiteralChip literal={literal} />
                      </span>
                    ))}
                  </div>
                  {satisfied !== undefined && (
                    <span
                      className={[
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        satisfied
                          ? "bg-emerald-500/25 text-emerald-300"
                          : "bg-red-500/25 text-red-300",
                      ].join(" ")}
                      title={satisfied ? "Regla satisfecha" : "Regla no satisfecha"}
                    >
                      {satisfied ? (
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
                      )}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveClause(clause.id)}
                    aria-label={`Eliminar regla ${index + 1}`}
                    className={`shrink-0 rounded-lg p-1.5 text-amber-100/40 transition-colors hover:bg-red-500/20 hover:text-red-300 ${focusRing}`}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Constructor de nueva cláusula */}
      <div className="mt-5 rounded-2xl border border-amber-300/20 bg-black/30 p-4">
        <p className="mb-3 text-sm font-bold text-amber-200">
          Nueva regla{" "}
          <span className="font-normal text-amber-100/50">
            (1 a 3 ingredientes con OR)
          </span>
        </p>

        <div className="space-y-2">
          {draft.map((literal, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              {index > 0 && (
                <span className="text-[11px] font-black text-amber-300/70">
                  OR
                </span>
              )}
              <button
                type="button"
                onClick={() => updateLiteral(index, { negated: !literal.negated })}
                aria-pressed={literal.negated}
                className={[
                  "rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors",
                  focusRing,
                  literal.negated
                    ? "border-red-400/60 bg-red-500/20 text-red-200"
                    : "border-white/15 bg-white/5 text-amber-100/70 hover:bg-white/10",
                ].join(" ")}
              >
                {literal.negated ? "NOT" : "sin NOT"}
              </button>
              <select
                value={literal.variable}
                onChange={(e) =>
                  updateLiteral(index, {
                    variable: e.target.value as IngredientId,
                  })
                }
                aria-label={`Ingrediente ${index + 1} de la nueva regla`}
                className={`flex-1 rounded-lg border border-white/15 bg-[#1c120b] px-3 py-1.5 text-sm font-medium text-amber-50 ${focusRing}`}
              >
                {INGREDIENTS.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.emoji} {ingredient.name}
                  </option>
                ))}
              </select>
              {draft.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  aria-label="Quitar ingrediente de la regla"
                  className={`rounded-lg p-1.5 text-amber-100/40 transition-colors hover:bg-red-500/20 hover:text-red-300 ${focusRing}`}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          ))}
        </div>

        {warning && (
          <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-200">
            {warning}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addSlot}
            disabled={draft.length >= MAX_LITERALS}
            className={`flex items-center gap-1.5 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100 transition-colors hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Ingrediente
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-extrabold text-stone-900 shadow-md transition-transform hover:scale-[1.02] ${focusRing}`}
          >
            Agregar regla
          </button>
        </div>
      </div>
    </section>
  );
}
