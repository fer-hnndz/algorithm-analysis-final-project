"use client"

import Image from "next/image";
import Link from "next/link";
import { BackgroundMusic } from "@/components/knapsack/BackgroundMusic";

export default function KnapsackIntro() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center font-sans p-4">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image 
          src="/knapsack_assets/Andy_room_backgorud.jpg" 
          alt="Andy's Room" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex flex-row  justify-between text-center text-white">
        
        <div className="flex flex-col items-center gap-6">
        {/* Logo Centered Top */}
        <div className="mb-4 animate-in fade-in zoom-in duration-700">
          <Image 
            src="/knapsack_assets/ToyStory.png" 
            alt="Toy Story Logo" 
            width={260} 
            height={80} 
            className="drop-shadow-2xl"
          />
        </div>

        <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-6xl drop-shadow-2xl">
          ¡Día de <span className="text-yellow-400">Mudanza!</span> 📦
        </h1>

            </div>

        <div className="flex flex-col items-center gap-6 basis-2/3">

        <div className="mb-8 space-y-4 text-base sm:text-xl leading-relaxed text-zinc-100 drop-shadow-md w-full">
          <p className="font-medium">
            Andy se muda a una nueva casa y tiene un problema muy difícil: 
            <span className="block mt-1 text-red-500 font-bold italic text-2xl sm:text-3xl">
              "¡No puede llevarse todos sus juguetes!"
            </span>
          </p>
          
          <p className="px-2 w-full">
            Cada juguete tiene un <span className="font-bold text-yellow-400 underline decoration-2 underline-offset-4">valor sentimental</span> único y un peso diferente. 
            Utilizando el <span className="font-bold text-blue-400">Algoritmo Knapsack (Enfoque Dinamico Y Enfoque Greedy)</span>, 
            ayudaremos a Andy a decidir cuáles son los juguetes más valiosos que caben en su caja.
          </p>

          <p className="text-zinc-300 text-sm sm:text-lg opacity-90">
            Aseguremos que sus mejores amigos lo acompañen, 
            <span className="block mt-0.5 font-semibold italic text-xs sm:text-sm">porque los que no quepan deberán ser donados.</span>
          </p>
        </div>

        <Link 
          href="/knapsack/simulation" 
          className="inline-block rounded-full bg-yellow-400 px-8 py-4 text-xl font-black text-blue-900 transition-all hover:bg-yellow-300 hover:scale-105 active:scale-95 shadow-[0_6px_0_rgb(161,98,7),0_10px_15px_rgba(0,0,0,0.4)]"
          >
          ¡Ayudar a Andy a Empacar! 
        </Link>
          </div>
      </div>

      <BackgroundMusic />
    </div>
  );
}
