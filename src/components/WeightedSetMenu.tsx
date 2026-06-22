"use client";

import { useState } from "react";
import Image from "next/image";
import MusicPlayer from "@/components/MusicPlayer";
import { allFish } from "@/app/weighted-set/fish-data";
import { solveWeightedSetCover } from "@/lib/weighted-set-solver";
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
  const [useSolver, setUseSolver] = useState<"custom" | "community">("custom");

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
    setBags([...bags, { id: Date.now(), fish: [...currentBag] }]);
    setCurrentBag([]);
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
    if (bags.length === 0 || targetSpecies.size === 0) return;

    if (useSolver === "community") {
      alert(
        "Error: El solver aceptado por la comunidad no esta implementado aun.",
      );
      return;
    }

    setResults(null);
    const sets = bags.map((bag) =>
      toIdentifiedSet(
        bag.id,
        bag.fish.map((f) => f.fish.id),
        bag.fish.reduce((sum, f) => sum + f.aggressiveness, 0),
      ),
    );

    const computed = solveWeightedSetCover(sets, [...targetSpecies]);
    setResults(computed);
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col">
      {/* Music bar */}
      <div className="h-10 shrink-0 bg-black/95 flex items-center justify-end px-4 border-b border-white/10">
        <MusicPlayer
          audioPath={audioPath}
          playing={true}
          className="static top-auto right-auto"
        />
      </div>

      <div className="flex-1 flex min-h-0 bg-black/90">
        {/* Left Sidebar */}
        <div className="w-72 shrink-0 bg-black/80 border-r border-white/20 p-4 flex flex-col gap-4 overflow-y-auto">
          <h2
            className="text-white text-xl text-center"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            Agregar Pez
          </h2>

          <div className="flex flex-col gap-2">
            <label
              className="text-white/80 text-sm"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Especie
            </label>
            <select
              value={selectedFish.id}
              onChange={(e) =>
                setSelectedFish(allFish.find((f) => f.id === e.target.value)!)
              }
              className="bg-white/10 text-white border border-white/30 rounded px-3 py-2 text-sm"
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
            <label
              className="text-white/80 text-sm"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Agresividad
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={aggressiveness}
              onChange={(e) => setAggressiveness(Number(e.target.value) || 1)}
              className="bg-white/10 text-white border border-white/30 rounded px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={addToBag}
            disabled={currentBag.length >= 3}
            className="mt-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            {currentBag.length >= 3
              ? "Bolsa llena (max 3)"
              : "Agregar a la bolsa"}
          </button>

          <p
            className="text-white/60 text-sm text-center"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            {currentBag.length}/3 peces en bolsa
          </p>
        </div>

        {/* Center */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Current Bag (1/3) */}
          <div className="h-1/3 bg-black/60 border-b border-white/20 p-4 flex flex-col gap-3">
            <h2
              className="text-white text-lg text-center"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Bolsa Actual
            </h2>

            <div className="flex-1 flex items-center justify-center gap-4 flex-wrap">
              {currentBag.length === 0 ? (
                <p
                  className="text-white/40 text-sm"
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
                    <Image
                      src={item.fish.image}
                      alt={item.fish.name}
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                    <span
                      className="text-white text-xs"
                      style={{ fontFamily: '"Findet-Nemo"' }}
                    >
                      {item.fish.name}
                    </span>
                    <span className="text-red-300 text-xs">
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
              className="self-center bg-amber-700/60 text-white px-6 py-2 rounded-lg hover:bg-amber-700/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Sellar y tirar al mar
            </button>
          </div>

          {/* Mar (2/3) */}
          <div className="h-2/3 bg-blue-950/30 p-4 overflow-y-auto">
            <h2
              className="text-white text-lg text-center mb-3"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Mar
            </h2>

            {bags.length === 0 ? (
              <p
                className="text-white/40 text-sm text-center mt-8"
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
                    <div className="flex flex-wrap gap-2 justify-center mb-2">
                      {bag.fish.map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <Image
                            src={item.fish.image}
                            alt={item.fish.name}
                            width={40}
                            height={40}
                            className="rounded"
                          />
                          <span className="text-white/70 text-[10px]">
                            {item.aggressiveness}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p
                      className="text-white text-sm text-center"
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
        <div className="w-64 shrink-0 bg-black/80 border-l border-white/20 p-4 flex flex-col gap-4 overflow-y-auto">
          <h2
            className="text-white text-xl text-center"
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
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span
                  className="text-white text-sm"
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
              className="text-white/60 text-xs"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Comunidad
            </span>
          </label>

          <button
            onClick={handleClearAll}
            className="bg-white/10 text-white/70 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors text-sm"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            Limpiar todo
          </button>

          <button
            onClick={handleCalculate}
            className="bg-amber-600 text-white px-4 py-3 rounded-lg hover:bg-amber-500 transition-colors text-lg"
            style={{ fontFamily: '"Findet-Nemo"' }}
          >
            Calcular
          </button>
        </div>
      </div>

      {/* Results Overlay */}
      {results !== null && (
        <div className="absolute inset-0 bg-black/80 z-40 flex items-center justify-center">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-white text-2xl"
                style={{ fontFamily: '"Findet-Nemo"' }}
              >
                Resultados
              </h2>
              <button
                onClick={() => setResults(null)}
                className="text-white/60 hover:text-white text-xl transition-colors"
                style={{ fontFamily: '"Findet-Nemo"' }}
              >
                X
              </button>
            </div>

            {results.length === 0 ? (
              <p
                className="text-white/60 text-center py-8"
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
                          className="text-white"
                          style={{ fontFamily: '"Findet-Nemo"' }}
                        >
                          {i === 0 && "★ "}Propuesta {i + 1}
                        </span>
                        <span
                          className="text-amber-400"
                          style={{ fontFamily: '"Findet-Nemo"' }}
                        >
                          Costo: {result.totalCost}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {resultBags.map((bag) => (
                          <div key={bag.id} className="flex items-center gap-1">
                            {bag.fish.map((item, j) => (
                              <div key={j} className="relative">
                                <Image
                                  src={item.fish.image}
                                  alt={item.fish.name}
                                  width={36}
                                  height={36}
                                  className="rounded"
                                />
                                <span className="absolute -bottom-1 -right-1 bg-black/70 text-white text-[9px] rounded px-0.5">
                                  {item.aggressiveness}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {results.length > 10 && (
                  <p
                    className="text-white/40 text-sm text-center"
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
