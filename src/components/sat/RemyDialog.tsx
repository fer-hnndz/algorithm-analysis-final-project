"use client";

import Link from "next/link";
import { ArrowLeft, ChefHat, ChevronRight, Soup } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SafeImage } from "./SafeImage";

type RemyDialogProps = {
  /** Se llama al cerrar el diálogo para pasar a la interfaz de pruebas. */
  onClose: () => void;
};

/**
 * Líneas que "dice" Remy. Cada línea reproduce su audio correspondiente
 * (/sat/audio/dialogo-N-remy.mp3) mientras se revela con efecto de máquina de
 * escribir. Si un audio no existe para una línea, esa línea suena en silencio.
 */
const REMY_LINES: readonly string[] = [
  "Soy Remy! Llegó un pedido especial: la famosa Sopa de Linguini. No podemos servir cualquier plato viejo...",
  "Cada ingrediente puede estar activado o desactivado. Tomate, queso, cebolla, champiñón, albahaca, picante, ajo y mantequilla.",
  "La sopa tiene reglas de sabor. Cada regla se cumple si al menos uno de sus ingredientes encaja: eso es un OR.",
  "Pero TODAS las reglas deben cumplirse a la vez, ¡al mismo tiempo! Eso es un AND entre todas las reglas.",
  "Mi misión —en realidad, la tuya— es encontrar una combinación de ingredientes que satisfaga todas las reglas. Eso es el problema SAT.",
  "¿Existirá una receta perfecta? ¡Vamos a la cocina a descubrirlo con el algoritmo DPLL!",
];

const DEFAULT_TYPE_SPEED_MS = 40;

export function RemyDialog({ onClose }: RemyDialogProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [typeSpeed, setTypeSpeed] = useState(DEFAULT_TYPE_SPEED_MS);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fullLine = REMY_LINES[lineIndex];
  const isLineComplete = charCount >= fullLine.length;
  const isLastLine = lineIndex === REMY_LINES.length - 1;

  // Reproduce el audio de la línea actual y, si se conoce su duración, ajusta
  // la velocidad de tipeo para que el texto termine junto con la voz.
  useEffect(() => {
    if (typeof Audio === "undefined") return;
    const audio = new Audio(`/sat/audio/dialogo-${lineIndex + 1}-remy.mp3`);
    audio.volume = 0.95;
    audioRef.current = audio;

    const onMeta = () => {
      const duration = audio.duration;
      if (Number.isFinite(duration) && duration > 0) {
        const perChar = (duration * 1000) / Math.max(1, REMY_LINES[lineIndex].length);
        setTypeSpeed(Math.min(85, Math.max(16, perChar)));
      }
    };
    audio.addEventListener("loadedmetadata", onMeta);
    void audio.play().catch(() => undefined);

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.pause();
    };
  }, [lineIndex]);

  // Efecto máquina de escribir.
  useEffect(() => {
    if (isLineComplete) return;
    const timer = setTimeout(() => setCharCount((c) => c + 1), typeSpeed);
    return () => clearTimeout(timer);
  }, [charCount, isLineComplete, typeSpeed]);

  const stopAudio = () => {
    audioRef.current?.pause();
  };

  const handleAdvance = () => {
    if (!isLineComplete) {
      setCharCount(fullLine.length);
      return;
    }
    if (isLastLine) {
      stopAudio();
      onClose();
      return;
    }
    setLineIndex((i) => i + 1);
    setCharCount(0);
    setTypeSpeed(DEFAULT_TYPE_SPEED_MS);
  };

  const handleSkipAll = () => {
    stopAudio();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-[#1a0f0a] px-4 pb-8 sm:items-center sm:pb-4">
      <Link
        href="/"
        onClick={stopAudio}
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-black/45 px-4 py-2 text-sm font-bold text-amber-100 backdrop-blur transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al menú
      </Link>

      {/* Fondos atmosféricos */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-950 via-[#2a140c] to-red-950" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(255,170,80,0.18), transparent 55%), radial-gradient(circle at 80% 80%, rgba(220,60,40,0.16), transparent 50%)",
        }}
      />
      {/* Viñeta */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 220px 60px rgba(0,0,0,0.7)" }}
      />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-2 sm:flex-row sm:items-end sm:gap-6">
        {/* Remy con halo de luz */}
        <div className="relative flex shrink-0 items-end justify-center">
          <div className="sat-glow absolute bottom-6 h-40 w-40 rounded-full bg-amber-400/40 blur-3xl sm:h-56 sm:w-56" />
          <SafeImage
            src="/sat/remy-guide.png"
            alt="Remy, el chef"
            className="sat-float relative h-44 w-44 object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.55)] sm:h-72 sm:w-72"
            fallback={<ChefHat className="h-24 w-24 text-amber-300 sm:h-36 sm:w-36" aria-hidden />}
            fallbackClassName="sat-float relative flex h-44 w-44 items-center justify-center sm:h-72 sm:w-72"
          />
        </div>

        {/* Caja de diálogo */}
        <div className="sat-pop-in relative flex-1">
          {/* Placa con el nombre */}
          <div className="absolute -top-4 left-6 z-10 flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-5 py-1.5 shadow-lg ring-2 ring-amber-200/40">
            <span className="text-sm font-black uppercase tracking-widest text-white">
              Remy
            </span>
            <span className="text-[11px] font-semibold text-amber-100/90">
              · Chef de la sopa
            </span>
          </div>

          <div
            className="relative cursor-pointer rounded-[28px] border border-amber-300/70 bg-gradient-to-b from-amber-50 to-orange-50 p-6 pt-7 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.6)]"
            onClick={handleAdvance}
          >
            {/* Borde interior decorativo */}
            <div className="pointer-events-none absolute inset-2 rounded-[22px] border border-amber-400/30" />

            <p className="relative min-h-[6.5rem] text-lg leading-relaxed text-stone-800 sm:text-xl sm:leading-relaxed">
              <span className="mr-1 text-2xl font-serif text-red-500/70">“</span>
              {fullLine.slice(0, charCount)}
              {!isLineComplete && (
                <span className="ml-0.5 inline-block w-[2px] animate-pulse text-red-600">
                  ▋
                </span>
              )}
            </p>

            <div className="relative mt-5 flex items-center justify-between gap-3">
              {/* Progreso */}
              <div className="flex items-center gap-1.5">
                {REMY_LINES.map((_, i) => (
                  <span
                    key={i}
                    className={[
                      "h-2 rounded-full transition-all duration-300",
                      i === lineIndex
                        ? "w-6 bg-red-600"
                        : i < lineIndex
                          ? "w-2 bg-orange-400"
                          : "w-2 bg-stone-300",
                    ].join(" ")}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdvance();
                }}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-7 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-red-900/30 transition-transform hover:scale-105 active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
              >
                {!isLineComplete ? (
                  "Saltar texto"
                ) : isLastLine ? (
                  <>
                    ¡A cocinar!
                    <Soup className="h-4 w-4" aria-hidden />
                  </>
                ) : (
                  <>
                    Continuar
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkipAll}
            className="mx-auto mt-4 block text-xs font-medium text-amber-200/60 underline-offset-4 transition-colors hover:text-amber-100 hover:underline"
          >
            Saltar diálogo
          </button>
        </div>
      </div>
    </div>
  );
}
