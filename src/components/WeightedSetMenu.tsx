"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MusicPlayer from "@/components/MusicPlayer";
import { allFish } from "@/app/weighted-set/fish-data";
import { solveWeightedSetCover } from "@/lib/weighted-set-solver";
import { communitySolveWeightedSetCover } from "@/lib/weighted-set-community";
import { toIdentifiedSet } from "@/lib/weighted-set-types";
import type { CoverProposal } from "@/lib/weighted-set-types";
import type { Fish, BagFish, Bag } from "@/app/weighted-set/types";

interface WeightedSetMenuProps {
  audioPath: string;
}

export default function WeightedSetMenu({ audioPath }: WeightedSetMenuProps) {
  const [selectedFish, setSelectedFish] = useState<Fish>(allFish[0]);
  const [aggressiveness, setAggressiveness] = useState(1);
  const [currentBag, setCurrentBag] = useState<BagFish[]>([]);
  const [bags, setBags] = useState<Bag[]>([]);
  const [targetSpecies, setTargetSpecies] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<CoverProposal[] | null>(null);
  const [usedSolver, setUsedSolver] = useState<"custom" | "community">("custom");
  const [useSolver, setUseSolver] = useState<"custom" | "community">("custom");
  const bagCounter = useRef(1);

  function handleClearAll() {
    setCurrentBag([]);
    setBags([]);
    setTargetSpecies(new Set());
    setResults(null);
  }

  function addToBag() {
    if (currentBag.length >= 3) return;
    setCurrentBag([...currentBag, { fish: selectedFish, aggressiveness }]);
  }

  function removeFromBag(index: number) {
    setCurrentBag(currentBag.filter((_, i) => i !== index));
  }

  function sealBag() {
    if (currentBag.length === 0) return;
    setBags([...bags, { id: bagCounter.current++, fish: [...currentBag] }]);
    setCurrentBag([]);
  }

  function generateRandomBags() {
    const newBags: Bag[] = [];
    for (let i = 0; i < 7; i++) {
      const count = Math.floor(Math.random() * 3) + 1;
      const fish: BagFish[] = [];
      const usedIds = new Set<string>();
      for (let j = 0; j < count; j++) {
        let f: Fish;
        do {
          f = allFish[Math.floor(Math.random() * allFish.length)];
        } while (usedIds.has(f.id));
        usedIds.add(f.id);
        fish.push({
          fish: f,
          aggressiveness: Math.floor(Math.random() * 10) + 1,
        });
      }
      newBags.push({ id: bagCounter.current++, fish });
    }
    setBags([...bags, ...newBags]);
  }

  function toggleTarget(speciesId: string) {
    const next = new Set(targetSpecies);
    if (next.has(speciesId)) {
      next.delete(speciesId);
    } else {
      next.add(speciesId);
    }
    setTargetSpecies(next);
  }

  function handleCalculate() {
    if (targetSpecies.size === 0) {
      alert("Selecciona al menos un pez en 'Quiero...' para calcular.");
      return;
    }
    if (bags.length === 0) {
      alert("Sella al menos una bolsa antes de calcular.");
      return;
    }

    setUsedSolver(useSolver);
    setResults(null);
    const sets = bags.map((bag) =>
      toIdentifiedSet(
        bag.id,
        bag.fish.map((f) => f.fish.id),
        bag.fish.reduce((sum, f) => sum + f.aggressiveness, 0),
      ),
    );

    const computed =
      useSolver === "community"
        ? communitySolveWeightedSetCover(sets, [...targetSpecies])
        : solveWeightedSetCover(sets, [...targetSpecies]);
    setResults(computed);
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col">
      <div className="absolute inset-0 -z-10">
        {/* <Image
          src="/weighted/nemo-ocean.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        /> */}
        <video
          src="/weighted/nemo_ocean_video.mp4"
          autoPlay
          loop
          muted
          className="object-cover"
        />
      </div>

      {/* Music bar */}
      <div className="h-10 shrink-0 flex items-center justify-between m-2">
        <Link
          href="/"
          className="bg-white/10 text-white px-4 py-1.5 rounded-lg hover:bg-white/20 transition-colors text-base antialiased"
          style={{ fontFamily: '"Findet-Nemo"' }}
        >
          Atras
        </Link>
        <MusicPlayer
          audioPath={audioPath}
          playing={true}
          className="static top-auto right-auto"
        />
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <div className="w-72 shrink-0 bg-linear-90 from-cyan-800/90 to-cyan-950/90 p-4 flex flex-col gap-4 overflow-y-auto rounded-2xl border-2 border-cyan-300 shadow shadow-cyan-300 m-4">
          <h2
            className="text-white text-2xl text-center antialiased"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            Agregar Pez
          </h2>

          <div className="flex flex-col gap-2">
            <label
              className="text-white/80 text-base antialiased"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Especie
            </label>
            <select
              value={selectedFish.id}
              onChange={(e) =>
                setSelectedFish(allFish.find((f) => f.id === e.target.value)!)
              }
              className="bg-white/10 text-white border border-white/30 rounded px-3 py-2 text-base antialiased"
            >
              {allFish.map((f) => (
                <option
                  key={f.id}
                  value={f.id}
                  className="bg-gray-900 text-white"
                >
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                className="text-white/80 text-base antialiased"
                style={{ fontFamily: '"Findet-Nemo"' }}
              >
                Agresividad
              </label>
              <span className="text-red-300 text-lg font-bold">
                {aggressiveness}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={aggressiveness}
              onChange={(e) => setAggressiveness(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-400"
            />
          </div>

          <button
            onClick={addToBag}
            disabled={currentBag.length >= 3}
            className="mt-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg antialiased"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            {currentBag.length >= 3
              ? "Bolsa llena (max 3)"
              : "Agregar a la bolsa"}
          </button>

          <p
            className="text-white/60 text-base text-center antialiased"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            {currentBag.length}/3 peces en bolsa
          </p>

          <button
            onClick={generateRandomBags}
            className="bg-cyan-600/40 text-white/80 px-4 py-2 rounded-lg hover:bg-cyan-600/60 transition-colors text-base antialiased border border-cyan-400/30"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            +7 bolsas random
          </button>
        </div>

        {/* Center */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Current Bag (1/3) */}
          <div className="h-1/3 p-4 flex flex-col  gap-3">
            <h2
              className="text-white text-3xl text-shadow-lg text-center antialiased"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Bolsa Actual
            </h2>

            <div className="flex-1 flex items-center justify-center gap-4 flex-wrap">
              {currentBag.length === 0 ? (
                <p
                  className="text-white text-shadow-lg text-lg antialiased"
                  style={{ fontFamily: '"Findet-Nemo"' }}
                >
                  Agrega peces desde la izquierda
                </p>
              ) : (
                currentBag.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => removeFromBag(i)}
                    className="relative group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <div
                      className="relative w-[130px] h-[130px] rounded-b-[40%] bg-white/15 border-2 border-white/25 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center"
                      style={{
                        background:
                          "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.03) 100%)",
                      }}
                    >
                      <Image
                        src={item.fish.image}
                        alt={item.fish.name}
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                    </div>
                    <span
                      className="text-white text-base antialiased"
                      style={{ fontFamily: '"Findet-Nemo"' }}
                    >
                      {item.fish.name}
                    </span>
                    <span className="text-red-300 text-sm">
                      {item.aggressiveness}
                    </span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      x
                    </span>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={sealBag}
              disabled={currentBag.length === 0}
              className="self-center bg-amber-700/60 text-white px-6 py-2 rounded-lg hover:bg-amber-700/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg antialiased"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Sellar y tirar al mar
            </button>
          </div>

          <hr className="border border-white" />
          {/* Mar (2/3) */}
          <div className="h-2/3 p-4 overflow-y-auto">
            <h2
              className="text-white text-center mb-3 text-3xl text-shadow-lg antialiased"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Mar
            </h2>

            {bags.length === 0 ? (
              <p
                className="text-base text-center mt-8 antialiased"
                style={{ fontFamily: '"Findet-Nemo"' }}
              >
                Las bolsas selladas apareceran aqui
              </p>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center">
                {bags.map((bag) => (
                  <div
                    key={bag.id}
                    className="bg-white/10 border border-white/20 rounded-lg p-3 min-w-[200px]"
                  >
                    <span
                      className="text-white/60 text-sm mb-1 block antialiased"
                      style={{ fontFamily: '"Findet-Nemo"' }}
                    >
                      Bolsa #{bag.id}
                    </span>
                    <div
                      className="relative w-full h-[120px] mb-2 rounded-b-[40%] bg-white/10 border-2 border-white/20 flex items-center justify-center gap-1 flex-wrap"
                      style={{
                        background:
                          "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.02) 100%)",
                      }}
                    >
                      {bag.fish.map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <Image
                            src={item.fish.image}
                            alt={item.fish.name}
                            width={48}
                            height={48}
                            className="rounded"
                          />
                          <span className="text-white/70 text-xs">
                            {item.aggressiveness}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p
                      className="text-white text-base text-center antialiased"
                      style={{ fontFamily: '"Findet-Nemo"' }}
                    >
                      Costo:{" "}
                      {bag.fish.reduce((sum, f) => sum + f.aggressiveness, 0)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-64 shrink-0 border-l p-4 flex flex-col gap-4 overflow-y-hidden bg-linear-90 from-cyan-800 to-cyan-950 rounded-2xl border-2 border-cyan-300 shadow shadow-cyan-300 m-4">
          <h2
            className="text-white text-2xl text-center antialiased"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            Quiero...
          </h2>

          <div className="flex flex-col gap-2">
            {allFish.map((f) => (
              <label
                key={f.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={targetSpecies.has(f.id)}
                  onChange={() => toggleTarget(f.id)}
                  className="accent-amber-500 w-4 h-4"
                />
                <Image
                  src={f.image}
                  alt={f.name}
                  width={40}
                  height={40}
                  className="rounded"
                />
                <span
                  className="text-white text-base antialiased"
                  style={{ fontFamily: '"Findet-Nemo"' }}
                >
                  {f.name}
                </span>
              </label>
            ))}
          </div>

          <div className="flex-1" />

          <label className="flex items-center gap-2 p-1 rounded hover:bg-white/5 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={useSolver === "community"}
              onChange={(e) =>
                setUseSolver(e.target.checked ? "community" : "custom")
              }
              className="accent-red-500 w-4 h-4"
            />
            <span
              className="text-white/60 text-sm antialiased"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Comunidad
            </span>
          </label>

          <button
            onClick={handleClearAll}
            className="bg-white/10 text-white/70 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors text-base antialiased"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            Limpiar todo
          </button>

          <button
            onClick={handleCalculate}
            className="bg-amber-600 text-white px-4 py-3 rounded-lg hover:bg-amber-500 transition-colors text-xl antialiased"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            Calcular
          </button>
        </div>
      </div>

      {/* Results Overlay */}
      {results !== null && (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-white text-3xl antialiased"
                style={{ fontFamily: '"Findet-Nemo"' }}
              >
                Resultados - {usedSolver === "custom" ? "Impl. Propia" : "Comunidad"}
              </h2>
              <button
                onClick={() => setResults(null)}
                className="text-white/60 hover:text-white text-2xl transition-colors"
                style={{ fontFamily: '"Findet-Nemo"' }}
              >
                X
              </button>
            </div>

            {results.length === 0 ? (
              <p
                className="text-white/60 text-center py-8 text-lg antialiased"
                style={{ fontFamily: '"Findet-Nemo"' }}
              >
                No hay combinacion de bolsas que cubra todas las especies.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {results.slice(0, 10).map((result, i) => {
                  const resultBags = bags.filter((b) =>
                    result.setIds.includes(b.id),
                  );
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${
                        i === 0
                          ? "bg-amber-900/30 border-amber-500/50"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-white text-lg antialiased"
                          style={{ fontFamily: '"Findet-Nemo"' }}
                        >
                          {i === 0 && "★ "}Propuesta {i + 1}
                        </span>
                        <span
                          className="text-amber-400 text-lg antialiased"
                          style={{ fontFamily: '"Findet-Nemo"' }}
                        >
                          Costo: {result.totalCost}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {resultBags.map((bag) => (
                          <div key={bag.id} className="flex flex-col items-center gap-0.5">
                            <span
                              className="text-white/50 text-xs antialiased"
                              style={{ fontFamily: '"Findet-Nemo"' }}
                            >
                              #{bag.id}
                            </span>
                            <div
                              className="relative w-[90px] h-[90px] rounded-b-[35%] bg-white/10 border-2 border-white/20 flex items-center justify-center gap-0.5 flex-wrap"
                              style={{
                                background:
                                  "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.03) 100%)",
                              }}
                            >
                              {bag.fish.map((item, j) => (
                              <div key={j} className="relative">
                                <Image
                                  src={item.fish.image}
                                  alt={item.fish.name}
                                  width={32}
                                  height={32}
                                  className="rounded"
                                />
                                <span className="absolute -bottom-1 -right-1 bg-black/70 text-white text-[10px] rounded px-0.5">
                                  {item.aggressiveness}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {results.length > 10 && (
                  <p
                    className="text-white/40 text-base text-center antialiased"
                    style={{ fontFamily: '"Findet-Nemo"' }}
                  >
                    ...y {results.length - 10} propuestas mas
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
