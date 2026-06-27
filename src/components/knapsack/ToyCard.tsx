"use client"

import { Heart, Package, Check } from 'lucide-react';
import { Toy, CREAM, GOLD } from '@/lib/knapsack/constants';

interface ToyCardProps {
  toy: Toy;
  checked: boolean;
  onToggle: () => void;
}

export function ToyCard({ toy, checked, onToggle }: ToyCardProps) {
  return (
    <div
      onClick={onToggle}
      className="relative cursor-pointer rounded-2xl select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-95"
      style={{ background: CREAM, border: `2px solid ${checked ? GOLD : '#d4b87a'}`, boxShadow: checked ? `0 0 0 2px ${GOLD}44` : undefined }}
    >
      <div
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all"
        style={{ background: checked ? '#5c3010' : '#c8a06088', border: '2px solid #a07030' }}
      >
        {checked && <Check size={14} strokeWidth={3} className="text-white" />}
      </div>

      <div className="m-2.5 rounded-xl overflow-hidden bg-white flex items-center justify-center" style={{ height: 145 }}>
        <img
          src={toy.image}
          alt={toy.name}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="px-3 pb-3">
        <p className="font-bold text-center text-[#3d1f0a] text-sm mb-1.5 truncate">{toy.name}</p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#c0392b]">
            <Heart size={13} fill="currentColor" /> {toy.value.toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#5c3010]">
            <Package size={13} /> {toy.weight}kg
          </span>
        </div>
      </div>
    </div>
  );
}
