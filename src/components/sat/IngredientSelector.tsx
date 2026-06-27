"use client";

import { INGREDIENTS } from "@/lib/sat/ingredients";
import type { IngredientId } from "@/lib/sat/types";
import { SafeImage } from "./SafeImage";

type IngredientSelectorProps = {
  /** Asignación encontrada por el solver (Sí/No por ingrediente), si existe. */
  assignment: Record<IngredientId, boolean> | null;
};

/**
 * Columna izquierda: los ingredientes disponibles = variables booleanas.
 * Si hay un resultado, cada tarjeta muestra si el ingrediente quedó en Sí/No.
 */
export function IngredientSelector({ assignment }: IngredientSelectorProps) {
  return (
    <section className="sat-panel flex flex-col p-5">
      <h2 className="text-xl font-extrabold sat-title-accent">Ingredientes</h2>
      <p className="mt-1 text-xs leading-relaxed text-amber-100/65">
        Cada ingrediente es una variable booleana.
      </p>

      <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
        {INGREDIENTS.map((ingredient) => {
          const value = assignment ? assignment[ingredient.id] : undefined;
          const state = value === undefined ? "neutral" : value ? "on" : "off";
          return (
            <li
              key={ingredient.id}
              className={[
                "group flex items-center gap-2.5 rounded-2xl border p-2.5 transition-all duration-200 hover:-translate-y-0.5",
                state === "on"
                  ? "border-emerald-400/50 bg-emerald-500/15 shadow-[0_0_18px_-6px_rgba(16,185,129,0.6)]"
                  : state === "off"
                    ? "border-white/10 bg-white/5 opacity-70"
                    : "border-amber-200/15 bg-white/5 hover:border-amber-200/35 hover:bg-white/10",
              ].join(" ")}
            >
              <SafeImage
                src={ingredient.imagePath}
                alt={ingredient.name}
                className="h-11 w-11 shrink-0 rounded-xl object-cover"
                fallback={ingredient.emoji}
                fallbackClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-2xl"
              />
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-bold leading-tight text-amber-50">
                  {ingredient.name}
                </p>
                <p
                  className={[
                    "text-[11px] font-semibold",
                    state === "on"
                      ? "text-emerald-300"
                      : state === "off"
                        ? "text-amber-100/45"
                        : "text-amber-100/40",
                  ].join(" ")}
                >
                  {state === "on"
                    ? "Sí ✓"
                    : state === "off"
                      ? "No ✕"
                      : "sin asignar"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
