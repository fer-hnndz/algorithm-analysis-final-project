"use client";

import { ChevronDown } from "lucide-react";

type SatExplanationProps = {
  /** Trace resumido de los pasos del solver (si ya se ejecutó). */
  trace: string[] | null;
};

/** Acordeón accesible basado en <details>/<summary>. */
function Accordion({
  title,
  badge,
  children,
  defaultOpen = false,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-amber-200/15 bg-white/5 px-4 [&_summary]:list-none"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-3 py-4 text-base font-bold text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70">
        <span className="flex items-center gap-2">
          {title}
          {badge && (
            <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[11px] font-bold text-amber-200">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown className="sat-chevron h-5 w-5 text-amber-300/70" aria-hidden />
      </summary>
      <div className="pb-4 text-sm leading-relaxed text-amber-100/80">
        {children}
      </div>
    </details>
  );
}

/**
 * Explicación de SAT/DPLL + trace colapsable de los pasos del algoritmo,
 * presentados como acordeones.
 */
export function SatExplanation({ trace }: SatExplanationProps) {
  return (
    <section className="sat-panel space-y-3 p-5">
      <Accordion title="¿Qué es SAT?">
        <p>
          <strong className="text-amber-200">SAT</strong> pregunta si existe una
          asignación de verdadero/falso a las variables que haga{" "}
          <em>verdadera</em> toda la fórmula en forma normal conjuntiva (FNC).
          Aquí: los ingredientes son variables, las reglas son cláusulas (unidas
          por OR), y todas las reglas deben cumplirse a la vez (AND).
        </p>
      </Accordion>

      <Accordion title="¿Cómo funciona DPLL?">
        <p>DPLL busca esa asignación combinando tres ideas:</p>
        <ul className="mt-2 space-y-1.5 pl-1">
          <li className="flex gap-2">
            <span className="text-amber-300" aria-hidden>
              •
            </span>
            <span>
              <strong className="text-amber-200">Propagación unitaria:</strong>{" "}
              si una regla tiene un solo ingrediente sin decidir, se fuerza su
              valor.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-300" aria-hidden>
              •
            </span>
            <span>
              <strong className="text-amber-200">Literal puro:</strong> si un
              ingrediente aparece siempre con la misma polaridad, se asigna para
              satisfacer esas reglas.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-300" aria-hidden>
              •
            </span>
            <span>
              <strong className="text-amber-200">
                Heurística + backtracking:
              </strong>{" "}
              elige la variable más frecuente, prueba un valor y, si falla,
              prueba el contrario.
            </span>
          </li>
        </ul>
        <p className="mt-3 rounded-xl bg-black/30 px-3 py-2 text-xs text-amber-100/60">
          SAT es NP-completo: no se conoce un algoritmo polinomial exacto. DPLL
          tiene peor caso <span className="font-mono">O(2ⁿ · m)</span> para n
          variables y m cláusulas, pero reduce el espacio de búsqueda en la
          práctica usando propagación unitaria, eliminación de literales puros y
          backtracking.
        </p>
      </Accordion>

      {trace && trace.length > 0 && (
        <Accordion title="Ver pasos del algoritmo" badge={String(trace.length)}>
          <ol className="sat-scroll max-h-72 overflow-auto rounded-xl border border-amber-200/10 bg-stone-950/80 p-3 font-mono text-xs text-emerald-300">
            {trace.map((line, index) => (
              <li key={index} className="whitespace-pre-wrap py-0.5">
                {line}
              </li>
            ))}
          </ol>
        </Accordion>
      )}
    </section>
  );
}
