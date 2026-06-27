"use client"

import { Heart, Package, Check, ArrowLeft, Gem, Flag, PackageOpen } from 'lucide-react';
import { Toy, CREAM, GOLD } from '@/lib/knapsack/constants';
import { SimulationResult } from '@/app/algoritmos/knapsack'; // Fix this path later if needed

interface ResultScreenProps {
  result: {
    maximo_valor: number;
    elementos: { nombre: string; valor: number; peso: number }[];
    espacio_vacio: number;
    algorithm: 'A' | 'B';
  };
  toys: Toy[];
  onBack: () => void;
}

function Stat({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode
  label: string
  value: string
  note?: string
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border-2 p-3"
      style={{ backgroundColor: "oklch(0.96 0.04 92)", borderColor: "oklch(0.6 0.09 62)" }}
    >
      <span className="mt-0.5">{icon}</span>
      <div>
        <dt className="font-heading text-xs font-bold uppercase tracking-wide" style={{ color: "oklch(0.45 0.06 55)" }}>
          {label}
        </dt>
        <dd className="font-heading text-xl font-bold" style={{ color: "oklch(0.28 0.05 50)" }}>
          {value}
          {note && <span className="ml-1 text-xs font-semibold" style={{ color: "oklch(0.5 0.05 55)" }}>({note})</span>}
        </dd>
      </div>
    </div>
  );
}

export function ResultScreen({ result, toys, onBack }: ResultScreenProps) {
  const packed = toys.filter(t => 
    result.elementos.some(e => e.nombre === t.name)
  );
  //const sealed = result.espacio_vacio === 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section
        className="relative overflow-hidden rounded-3xl border-4 p-5 shadow-xl"
        style={{ backgroundColor: "oklch(0.42 0.06 55)", borderColor: "oklch(0.5 0.09 60)" }}
      >
        <button
          onClick={onBack}
          className="rounded-full bg-[oklch(0.95_0.04_90)] font-heading font-bold text-[oklch(0.3_0.05_55)] shadow hover:opacity-90 px-4 py-2 text-sm flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Configurar
        </button>

        <div className="relative mx-auto mt-2 flex max-w-xl items-end justify-center">
          <div className="absolute -top-2 left-0 right-0 z-10 flex flex-wrap items-end justify-center gap-2 px-4">
            {packed.map((toy, i) => (
              <div
                key={toy.id}
                className="w-20 rounded-xl border-2 border-accent bg-white p-1 shadow-lg sm:w-24 animate-bounce-in flex flex-col h-[120px] sm:h-[140px]"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                  <img src={toy.image} alt={toy.name} className="object-contain w-full h-full p-1" />
                </div>
                <div className="text-center px-0.5 py-1 flex flex-col justify-center flex-1">
                  <p className="truncate font-heading text-[9px] font-bold text-[#3d1f0a] leading-tight h-3">
                    {toy.name}
                  </p>
                  <div className="flex items-center justify-between text-[8px] font-bold mt-0.5">
                    <span className="flex items-center gap-0.5 text-[#c0392b]">
                      <Heart size={8} fill="currentColor" /> {toy.value}
                    </span>
                    <span className="flex items-center gap-0.5 text-[#5c3010]">
                      <Package size={8} /> {toy.weight}kg
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-28 w-full">
            <img
              src="/knapsack_assets/box.png" // Assuming box.png exists or will be added
              alt="Caja de mudanza de Andy"
              className="mx-auto h-auto w-full max-w-md drop-shadow-xl"
            />
            <p className="pointer-events-none absolute bottom-[22%] left-1/2 -translate-x-1/2 -rotate-2 font-heading text-lg font-bold uppercase tracking-wide text-[oklch(0.4_0.06_55)] sm:text-2xl">
              Caja de mudanza
              
            </p>
          </div>
        </div>
      </section>

      <aside
        className="rounded-3xl border-4 p-5 shadow-xl"
        style={{ backgroundColor: "oklch(0.32 0.05 55)", borderColor: "oklch(0.5 0.09 60)" }}
      >
        <h2
          className="text-center font-heading text-lg font-extrabold uppercase tracking-wide"
          style={{ color: "oklch(0.82 0.13 85)" }}
        >
          Resultados Panel
        </h2>

        <dl className="mt-5 space-y-4">
          <Stat
            icon={<PackageOpen size={20} style={{ color: "oklch(0.45 0.08 50)" }} />}
            label="Elementos empacados"
            value={`${packed.length} juguete(s)`}
          />
          <Stat
            icon={<Gem size={20} style={{ color: "oklch(0.55 0.09 60)" }} />}
            label="Valor total conseguido"
            value={Math.floor(result.maximo_valor).toString()}
          />
          <Stat
            icon={<Flag size={20} style={{ color: "oklch(0.5 0.1 45)" }} />}
            label="Espacio residual"
            value={`${result.espacio_vacio} kg`}
            //note={sealed ? "¡Mochila sellada!" : "queda hueco"}
          />
        </dl>

        <div
          className="mt-5 rounded-xl p-3 text-center text-xs leading-relaxed"
          style={{ backgroundColor: "oklch(0.26 0.05 50)", color: "oklch(0.9 0.04 85)" }}
        >
          {result.algorithm === "A"
            ? "Approach A usa programación dinámica: encuentra el valor máximo exacto que cabe en la caja."
            : "Approach B es voraz (doble pasada): rápido, prioriza valor/peso, pero puede no ser óptimo."}
        </div>
      </aside>
    </div>
  );
}
