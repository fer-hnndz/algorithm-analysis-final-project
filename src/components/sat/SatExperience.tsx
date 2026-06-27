"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { evaluateClauses } from "@/lib/sat/dpll-solver";
import { getExample } from "@/lib/sat/examples";
import { SOLVER_OPTIONS, solveWithMethod } from "@/lib/sat/solver-methods";
import type { Clause, Literal, SolverMethod, SolverResult } from "@/lib/sat/types";
import { BackgroundVideo } from "./BackgroundVideo";
import { ClauseBuilder } from "./ClauseBuilder";
import { IngredientSelector } from "./IngredientSelector";
import { RemyDialog } from "./RemyDialog";
import { SatExplanation } from "./SatExplanation";
import { SatIntro } from "./SatIntro";
import { SatLanding } from "./SatLanding";
import { SatMenu } from "./SatMenu";
import { SatResult } from "./SatResult";
import { useSatSound } from "./useSatSound";

/**
 * Etapas de la experiencia:
 *  - "landing": pantalla con botón Start.
 *  - "intro":   video a pantalla completa (con audio) + skip.
 *  - "remy":    diálogo de Remy planteando el problema.
 *  - "app":     interfaz de pruebas con fondo de video en loop.
 */
type Stage = "landing" | "intro" | "remy" | "app";

/**
 * Orquestador de la experiencia SAT. Mantiene el estado de React (etapa,
 * cláusulas, resultado) y delega TODO el cálculo al solver puro `solveSat`, de
 * modo que el algoritmo nunca muta el estado de React.
 */
export function SatExperience() {
  const [stage, setStage] = useState<Stage>("landing");
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] =
    useState<SolverMethod>("community-dpll");

  const clauseIdRef = useRef(0);
  const { musicOn, startMusic, toggleMusic, play } = useSatSound();

  // Al entrar a la cocina, la música de fondo arranca sola (el usuario ya
  // interactuó pasando la intro/diálogo, así que el navegador la permite).
  useEffect(() => {
    if (stage === "app") startMusic();
  }, [stage, startMusic]);

  const nextClauseId = (): string => {
    clauseIdRef.current += 1;
    return `c-${clauseIdRef.current}`;
  };

  const loadExample = (id: string) => {
    const example = getExample(id);
    if (!example) return;
    // Clonar con ids frescos para no chocar con cláusulas añadidas por el usuario.
    const cloned: Clause[] = example.formula.map((clause) => ({
      id: nextClauseId(),
      literals: clause.literals.map((l) => ({ ...l })),
    }));
    setClauses(cloned);
    setResult(null);
    setWarning(null);
    play("click");
  };

  const addClause = (literals: Literal[]) => {
    setClauses((current) => [...current, { id: nextClauseId(), literals }]);
    setResult(null);
    setWarning(null);
  };

  const removeClause = (clauseId: string) => {
    setClauses((current) => current.filter((c) => c.id !== clauseId));
    setResult(null);
    play("click");
  };

  const clearAll = () => {
    setClauses([]);
    setResult(null);
    setWarning(null);
    play("click");
  };

  const solve = () => {
    if (clauses.length === 0) {
      setWarning("No hay reglas: agregá al menos una cláusula o cargá un ejemplo.");
      setResult(null);
      return;
    }
    const hasVariables = clauses.some((c) => c.literals.length > 0);
    if (!hasVariables) {
      setWarning("No hay ingredientes involucrados en las reglas.");
      setResult(null);
      return;
    }
    setWarning(null);
    // El solver recibe una copia de las cláusulas y no muta el estado.
    const computed = solveWithMethod(
      clauses.map((c) => ({ ...c, literals: [...c.literals] })),
      selectedMethod
    );
    setResult(computed);
    play(computed.satisfiable ? "success" : "error");
  };

  const selectedOption = useMemo(
    () => SOLVER_OPTIONS.find((option) => option.id === selectedMethod),
    [selectedMethod]
  );

  // Mapa id de cláusula -> satisfecha, solo cuando hay asignación válida.
  const satisfiedById = useMemo<Record<string, boolean> | null>(() => {
    if (!result || !result.satisfiable || !result.assignment) return null;
    const evaluation = evaluateClauses(clauses, result.assignment);
    return evaluation.reduce<Record<string, boolean>>((acc, { clause, satisfied }) => {
      acc[clause.id] = satisfied;
      return acc;
    }, {});
  }, [result, clauses]);

  if (stage === "landing") {
    return <SatLanding onStart={() => setStage("intro")} />;
  }

  if (stage === "intro") {
    return <SatIntro onFinish={() => setStage("remy")} />;
  }

  if (stage === "remy") {
    return <RemyDialog onClose={() => setStage("app")} />;
  }

  return (
    <div className="relative mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:py-10">
      <BackgroundVideo />

      <header className="sat-fade-in mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-200 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {selectedOption?.shortTitle ?? "SAT Solver"}
        </span>
        <h1 className="sat-title-accent text-4xl font-black leading-tight tracking-tight drop-shadow-[0_3px_12px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-6xl">
          La Sopa Perfecta de Linguini
        </h1>
        <p className="mt-2 text-lg font-semibold text-amber-100/90 drop-shadow sm:text-xl">
          SAT aplicado a reglas de ingredientes
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-amber-100/70">
          Encuentra una combinación de ingredientes que satisfaga todas las
          reglas de la sopa.
        </p>
      </header>

      {warning && (
        <div
          role="alert"
          className="mx-auto mb-6 flex max-w-2xl items-center justify-center gap-2 rounded-2xl border border-amber-300/40 bg-amber-500/15 p-3 text-center text-sm font-semibold text-amber-100 backdrop-blur"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
          {warning}
        </div>
      )}

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[300px_minmax(0,1fr)_300px]">
        <IngredientSelector assignment={result?.assignment ?? null} />
        <ClauseBuilder
          clauses={clauses}
          satisfiedById={satisfiedById}
          onAddClause={addClause}
          onRemoveClause={removeClause}
          onSound={() => play("click")}
        />
        <SatMenu
          onLoadExample={loadExample}
          onSolve={solve}
          onClear={clearAll}
          onToggleMusic={toggleMusic}
          selectedMethod={selectedMethod}
          onSelectMethod={(method) => {
            setSelectedMethod(method);
            setResult(null);
            play("click");
          }}
          musicOn={musicOn}
          canSolve={clauses.length > 0}
        />
      </div>

      <div className="mt-6 space-y-5">
        {result && (
          <SatResult
            result={result}
            clauses={clauses}
            satisfiedById={satisfiedById ?? {}}
            methodTitle={selectedOption?.title}
          />
        )}
        <SatExplanation trace={result?.trace ?? null} />
      </div>
    </div>
  );
}
