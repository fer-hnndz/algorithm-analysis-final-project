"use client";

import Link from "next/link";
import { ArrowLeft, ChefHat, Play, Volume2 } from "lucide-react";
import { SafeImage } from "./SafeImage";

type SatLandingProps = {
  onStart: () => void;
};

/**
 * Pantalla de inicio. Solo muestra el título y un botón "Start". El click en
 * Start es el gesto de usuario que permite reproducir la intro CON audio
 * (los navegadores bloquean el autoplay con sonido sin interacción previa).
 */
export function SatLanding({ onStart }: SatLandingProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-stone-950 via-amber-950 to-red-950 px-6 text-center">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-black/45 px-4 py-2 text-sm font-bold text-amber-100 backdrop-blur transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al menú
      </Link>

      <SafeImage
        src="/sat/remy-guide.png"
        alt="Remy"
        className="mb-6 h-28 w-28 rounded-full border-4 border-amber-400/60 object-cover shadow-2xl"
        fallback={<ChefHat className="h-14 w-14 text-amber-700" aria-hidden />}
        fallbackClassName="mb-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-400/60 bg-amber-200 shadow-2xl"
      />

      <h1 className="text-4xl font-extrabold text-amber-50 drop-shadow-lg sm:text-6xl">
        La Sopa Perfecta de Linguini
      </h1>
      <p className="mt-3 max-w-xl text-base text-amber-200/90 sm:text-lg">
        Una experiencia de cocina lógica · SAT resuelto con DPLL
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-10 flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-12 py-4 text-xl font-extrabold text-white shadow-xl transition-transform hover:scale-105 active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
      >
        <Play className="h-5 w-5 fill-current" aria-hidden />
        Start
      </button>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-amber-200/50">
        <Volume2 className="h-3.5 w-3.5" aria-hidden />
        Subí el volumen para disfrutar la intro
      </p>
    </div>
  );
}
