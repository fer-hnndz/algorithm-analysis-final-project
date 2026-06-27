"use client"

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Brain, Rocket, Wand2 } from "lucide-react";

const ALGORITHMS = [
  {
    id: "knapsack",
    title: "Knapsack Problem",
    description: "Acompaña a Andy y sus juguetes en una mudanza llena de decisiones.",
    icon: <Rocket className="h-8 w-8 text-blue-400" />,
    href: "/knapsack",
    color: "from-blue-500 to-indigo-600",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center font-sans">
      {/* Disney Theme Background - Using a stylized gradient and patterns since I don't have a specific Disney generic BG image */}
      <div className="absolute inset-0 -z-10 bg-[#0a0a2a]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a4a] via-[#0a0a2a] to-[#2a1a4a]" />
        {/* Stylized "Magical" Particles/Stars */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-6 py-12 text-center text-white">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-blue-200 mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Bienvenido al Mundo Mágico de los Algoritmos</span>
          </div>
          <h1 className="mb-4 text-6xl font-extrabold tracking-tight sm:text-8xl drop-shadow-2xl">
            Disney <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Algo-Hub</span> ✨
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-zinc-300 drop-shadow-md">
            Descubre la magia detrás de la eficiencia. Selecciona una aventura para comenzar a explorar el análisis de algoritmos.
          </p>
        </div>

        {/* Algorithm Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ALGORITHMS.map((algo) => (
            <Link 
              key={algo.id} 
              href={algo.href} 
              className="group relative overflow-hidden rounded-3xl bg-white/5 p-1 transition-all hover:scale-105 hover:bg-white/10 border border-white/10 backdrop-blur-md shadow-2xl"
            >
              <div className="relative h-full rounded-2xl bg-zinc-900/40 p-8 flex flex-col items-center text-center">
                <div className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${algo.color} shadow-lg transition-transform group-hover:rotate-12`}>
                  {algo.icon}
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">{algo.title}</h3>
                <p className="mb-8 text-sm text-zinc-400 leading-relaxed">{algo.description}</p>
                
                <div className="mt-auto flex items-center gap-2 rounded-full bg-white text-blue-900 px-6 py-3 text-sm font-bold transition-all group-hover:bg-blue-400 group-hover:text-white">
                  <span>Entrar a la Aventura</span>
                  <Wand2 className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}

          {/* Placeholder for upcoming algorithms */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-white/10 p-8 flex flex-col items-center justify-center text-center group hover:border-white/20 transition-all">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 text-white/20 group-hover:text-white/40 transition-colors">
              <Brain className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-white/30">Próximas Aventuras</h3>
            <p className="text-sm text-white/20">Más magia en camino...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
