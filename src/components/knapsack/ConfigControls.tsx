"use client"

import { Play, Music, VolumeX } from 'lucide-react';
import { PANEL, CREAM, GOLD } from '@/lib/knapsack/constants';

interface ConfigControlsProps {
  capacity: number;
  setCapacity: (n: number) => void;
  algorithm: 'A' | 'B';
  setAlgorithm: (a: 'A' | 'B') => void;
  selectedCount: number;
  simulating: boolean;
  onSimulate: () => void;
}

export function ConfigControls({
  capacity, setCapacity,
  algorithm, setAlgorithm,
  selectedCount,
  simulating,
  onSimulate
}: ConfigControlsProps) {
  return (
    <div className="rounded-2xl p-3 mx-3 flex flex-col gap-2.5" style={{ background: PANEL }}>
      <div className="flex gap-3">
        <div className="flex-1 min-w-[80px]">
          <label className="text-xs font-bold tracking-wider block mb-1" style={{ color: GOLD }}>CAPACIDAD DE LA CAJA</label>
          <input
            type="number" min={1} max={999} value={capacity}
            onChange={e => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full rounded-xl px-2.5 py-1.5 font-black text-lg focus:outline-none focus:ring-2 text-center"
            style={{ background: CREAM, border: `2px solid ${GOLD}`, color: PANEL, caretColor: PANEL }}
          />
        </div>
        <button
          onClick={onSimulate}
          disabled={simulating || selectedCount === 0}
          className="flex-1 min-w-[90px] py-2 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          style={{ background: '#27a040', color: 'white', boxShadow: '0 4px 14px #27a04055', alignSelf: 'flex-end' }}
        >
          {simulating ? '⚙️...' : <><Play size={14} fill="white" /> ¡A EMPACAR!</>}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-black uppercase italic" style={{ color: GOLD }}>Planificando la mudanza...</label>
            {/* <span className="text-[10px] font-black uppercase italic" style={{ color: GOLD }}>Planificando la mudanza...</span> */}
          </div>
          <div className="flex rounded-xl overflow-hidden p-1" style={{ background: '#2a1208', border: `2px solid #6b3a15` }}>
            {(['A', 'B'] as const).map(alg => (
              <button
                key={alg}
                onClick={() => setAlgorithm(alg)}
                className="flex-1 py-2 text-xs font-bold transition-all rounded-lg"
                style={algorithm === alg
                  ? { background: GOLD, color: PANEL }
                  : { background: 'transparent', color: '#d4a85588' }}
            >
              {alg === 'A' ? 'A: Enfoque Dinámico' : 'B: Enfoque Greedy'}
            </button>
            ))}
          </div>
        </div>
        <div className="text-right bg-black/20 px-3 py-1 rounded-xl border border-white/10 ml-3">
          <span className="text-[10px] block font-bold" style={{ color: GOLD }}>FAVORITOS</span>
          <span className="text-lg font-black" style={{ color: 'white' }}>{selectedCount}</span>
        </div>
      </div>
    </div>
  );
}
