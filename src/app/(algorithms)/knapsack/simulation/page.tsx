"use client"

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Toy, TOYS } from  '@/lib/knapsack/constants'
import { ToyCard } from '@/components/knapsack/ToyCard';
import { ConfigControls } from '@/components/knapsack/ConfigControls';
import { AndyGuide, Background } from '@/components/knapsack/AndyGuide';
import { ResultScreen } from '@/components/knapsack/ResultScreen';
import { knapsack_01, greedy_knapsack_variant } from '@/app/algoritmos/knapsack';

const PAGE_SIZE = 8;

export default function KnapsackSimulation() {
  const [capacity, setCapacity] = useState(50);
  const [algorithm, setAlgorithm] = useState<'A' | 'B'>('A');
  const [selectedIds, setSelectedIds] = useState<string[]>(TOYS.map(t => t.id));
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  const toggleToy = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredToys = useMemo(() => {
    return TOYS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const totalPages = Math.ceil(filteredToys.length / PAGE_SIZE);
  const visibleToys = filteredToys.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const runSimulation = () => {
    setSimulating(true);
    
    const filteredForAlgo = TOYS.filter(t => selectedIds.includes(t.id));
    const valores = filteredForAlgo.map(t => t.value);
    const pesos = filteredForAlgo.map(t => t.weight);
    const nombres = filteredForAlgo.map(t => t.name);
    
    // FIX: Force integer capacity to prevent decimal results
    const intCapacity = Math.floor(capacity);

    setTimeout(() => {
      const res = algorithm === 'A' 
        ? knapsack_01(intCapacity, valores, pesos, nombres)
        : greedy_knapsack_variant(intCapacity, valores, pesos, nombres);
      
      setResult({ ...res, algorithm });
      setSimulating(false);
    }, 600);
  };

  if (result) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden p-4 sm:p-8">
        <Background />
        <div className="relative z-10 max-w-6xl mx-auto">
          <ResultScreen 
            result={result} 
            toys={TOYS} 
            onBack={() => setResult(null)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden pt-0 sm:pt-2 pb-4 sm:pb-8 px-4 sm:px-8">
      <Background />
      
      <div className="relative z-20 max-w-7xl mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/60 to-transparent rounded-3xl text-white">
          <div className="flex flex-col gap-1">
            <Link 
              href="/" 
              className="flex items-center gap-1 text-xs font-bold opacity-80 hover:opacity-100 transition-opacity w-fit"
            >
              <ArrowLeft size={14} />
              <span>Volver al Inicio</span>
            </Link>
            <h1 className="text-2xl sm:text-4xl font-black text-yellow-400 uppercase tracking-tighter drop-shadow-md">
              Mudanza de Andy
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white font-bold text-xl opacity-80 hidden sm:block">La Caja de Andy</span>
            <img src="/knapsack_assets/ToyStory.png" alt="Toy Story Logo" className="h-24 w-auto object-contain" />
          </div>
        </div>

        {/* Main UI Grid - Restructured: Controls & Andy on left, Toys on right */}
        <div className="grid items-start gap-8 lg:grid-cols-[400px_1fr]">
          {/* Left Column: Control Panel and Andy */}
          <div className="flex flex-col gap-6">
            <ConfigControls 
              capacity={capacity} 
              setCapacity={setCapacity} 
              algorithm={algorithm} 
              setAlgorithm={setAlgorithm} 
              selectedCount={selectedIds.length} 
              simulating={simulating} 
              onSimulate={runSimulation}
            />
            
            {/* Andy Guide: Positioned below the controls */}
            <div className="relative h-[500px] w-full pointer-events-none">
               <AndyGuide />
            </div>
          </div>
          
          {/* Right Column: Expanded Toys Grid - More compact padding */}
          <div className="relative rounded-3xl border-4 p-4 shadow-xl" style={{ backgroundColor: '#3d1f0a', borderColor: '#e8a830' }}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-extrabold uppercase tracking-wide text-[#e8a830]">
                Juguetes para Empacar
              </h2>
              
              <div className="relative flex items-center">
                <Search className="absolute left-3 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar juguete..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setCurrentPage(0); }}
                  className="pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {visibleToys.map(toy => (
                <ToyCard 
                  key={toy.id} 
                  toy={toy} 
                  checked={selectedIds.includes(toy.id)} 
                  onToggle={() => toggleToy(toy.id)} 
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-3 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <span className="text-white text-base font-bold">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-3 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
}
