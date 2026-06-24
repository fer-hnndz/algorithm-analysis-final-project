"use client";

import {
  Ban,
  Flame,
  Soup,
  Sparkles,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { SAT_EXAMPLES } from "@/lib/sat/examples";

type SatMenuProps = {
  onLoadExample: (id: string) => void;
  onSolve: () => void;
  onClear: () => void;
  onToggleMusic: () => void;
  musicOn: boolean;
  canSolve: boolean;
};

/** Ícono y acento de color por ejemplo, para que se vean como opciones. */
const EXAMPLE_META: Record<string, { Icon: LucideIcon; color: string; ring: string }> = {
  "easy-sat": { Icon: Sparkles, color: "text-emerald-300", ring: "hover:border-emerald-400/50" },
  "hard-sat": { Icon: Flame, color: "text-orange-300", ring: "hover:border-orange-400/50" },
  unsat: { Icon: Ban, color: "text-red-300", ring: "hover:border-red-400/50" },
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70";

/**
 * Columna derecha: panel de control. Ejemplos clicables, CTA principal
 * "Calcular receta perfecta", "Limpiar todo" y toggle de música.
 */
export function SatMenu({
  onLoadExample,
  onSolve,
  onClear,
  onToggleMusic,
  musicOn,
  canSolve,
}: SatMenuProps) {
  return (
    <section className="sat-panel flex flex-col gap-4 p-5">
      <h2 className="text-xl font-extrabold sat-title-accent">Cocina de Remy</h2>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200/60">
          Ejemplos
        </p>
        {SAT_EXAMPLES.map((example) => {
          const meta = EXAMPLE_META[example.id] ?? {
            Icon: Soup,
            color: "text-amber-300",
            ring: "hover:border-amber-300/50",
          };
          const Icon = meta.Icon;
          return (
            <button
              key={example.id}
              type="button"
              onClick={() => onLoadExample(example.id)}
              className={`group flex items-start gap-3 rounded-2xl border border-amber-200/15 bg-white/5 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 ${meta.ring} ${FOCUS_RING}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.color}`} aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-amber-50">
                  {example.title}
                </span>
                <span className="block text-xs leading-snug text-amber-100/55">
                  {example.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSolve}
        disabled={!canSolve}
        className={`flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-4 text-base font-black text-white shadow-[0_12px_30px_-10px_rgba(220,60,40,0.8)] transition-transform hover:scale-[1.03] active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${FOCUS_RING}`}
      >
        <Soup className="h-5 w-5" aria-hidden />
        Calcular receta perfecta
      </button>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onClear}
          className={`rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-amber-100/80 transition-colors hover:bg-white/10 ${FOCUS_RING}`}
        >
          Limpiar todo
        </button>

        <button
          type="button"
          onClick={onToggleMusic}
          aria-pressed={musicOn}
          className={`flex items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/5 px-3 py-2.5 text-sm font-medium text-amber-100/80 transition-colors hover:bg-amber-300/15 ${FOCUS_RING}`}
        >
          {musicOn ? (
            <Volume2 className="h-4 w-4" aria-hidden />
          ) : (
            <VolumeX className="h-4 w-4" aria-hidden />
          )}
          {musicOn ? "Música activada" : "Música silenciada"}
        </button>
      </div>
    </section>
  );
}
