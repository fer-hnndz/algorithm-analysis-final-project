"use client"

import Image from "next/image";
import Link from "next/link";
import { Fredoka, Inter } from "next/font/google";
import { BackgroundMusic } from "@/components/knapsack/BackgroundMusic";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export default function KnapsackIntro() {
  return (
    <div
      className={`${fredoka.variable} ${inter.variable} relative min-h-screen w-full overflow-x-hidden flex items-center justify-center p-4 sm:p-8`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Fondo: cuarto de Andy con viñeta para legibilidad */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/knapsack_assets/Andy_room_backgorud.jpg"
          alt="Cuarto de Andy"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B2A4A]/35 via-[#1B2A4A]/50 to-[#1B2A4A]/80" />
      </div>

      {/* Contenido: logo+titulo a la izquierda, nota+CTA a la derecha */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:gap-10 md:text-left motion-reduce:[&_*]:!animate-none">

        {/* COLUMNA IZQUIERDA: cinta + logo + titulo */}
        <div className="flex flex-col items-center gap-5 md:basis-1/3 md:items-start">

          {/* Eyebrow: cinta de embalaje */}
          <div className="-rotate-2 bg-[#C68F4B] px-5 py-1.5 shadow-[0_4px_0_rgba(0,0,0,0.25)] animate-in fade-in slide-in-from-top-3 duration-500">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#3a2410]">
              Frágil · Cuidado
            </span>
          </div>

          <div className="animate-in fade-in zoom-in duration-700">
            <Image
              src="/knapsack_assets/ToyStory.png"
              alt="Toy Story"
              width={240}
              height={74}
              className="drop-shadow-2xl"
            />
          </div>

          <h1
            className="relative text-4xl sm:text-5xl font-semibold leading-[1.05] text-[#F7F1E1] drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Día de
            <span className="relative mx-1 inline-block">
              <span className="relative z-10">Mudanza</span>
              <span className="absolute inset-x-[-6%] bottom-1 h-[0.45em] -rotate-1 bg-[#C23B33]/90 -z-0" />
            </span>
            <span className="block sm:inline"> 📦</span>
          </h1>
        </div>

        {/* COLUMNA DERECHA: ficha de envio + CTA */}
        <div className="flex w-full flex-col items-center gap-6 md:basis-2/3 md:items-center">

  <div
    className="w-full rounded-sm border-2 border-dashed border-[#C68F4B]/60 bg-[#F7F1E1]/95 px-6 py-7 text-left shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 sm:px-8"
  >
    <p className="text-base sm:text-lg leading-relaxed text-[#3a2410]">
      Andy se muda a una nueva casa y tiene un problema muy difícil:
    </p>
    <p
      className="mt-2 text-xl sm:text-2xl font-semibold italic text-[#C23B33] text-center" // Añadido text-center opcional para centrar la frase de Andy
      style={{ fontFamily: "var(--font-display)" }}
    >
      "¡No puede llevarse todos sus juguetes!"
    </p>

    <div className="my-5 h-px w-full bg-[#C68F4B]/40" />

    <p className="text-sm sm:text-base leading-relaxed text-[#5a4530]">
      Cada juguete tiene un{" "}
      <span className="font-semibold text-[#a3760c]">valor sentimental</span>{" "}
      único y un peso diferente. Usando el{" "}
      <span className="font-semibold text-[#1B2A4A]">
        Algoritmo Knapsack (Enfoque Dinámico y Enfoque Greedy)
      </span>
      , ayudaremos a Andy a decidir cuáles juguetes valen la pena empacar.
    </p>

    <p className="mt-3 text-xs sm:text-sm italic text-[#8a7560]">
      Los que no quepan en la caja deberán ser donados.
    </p>
  </div>

  {/* El botón ahora se alineará automáticamente al centro gracias al contenedor padre */}
  <Link
    href="/knapsack/simulation"
    className="inline-block rounded-full bg-[#F2B705] px-9 py-4 text-lg sm:text-xl font-semibold text-[#1B2A4A] transition-all hover:scale-105 hover:bg-[#ffc91a] active:scale-95 shadow-[0_6px_0_rgb(161,98,7),0_10px_20px_rgba(0,0,0,0.35)] animate-in fade-in zoom-in duration-700 delay-300 text-center"
    style={{ fontFamily: "var(--font-display)" }}
  >
    ¡Ayudar a Andy a empacar!
  </Link>
</div>
      </div>

      <BackgroundMusic />
    </div>
  );
}