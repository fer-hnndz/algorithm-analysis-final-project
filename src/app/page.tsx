import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-24 px-8 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Proyecto Final: Problemas NP
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Demos interactivas para explicar algoritmos aproximados, complejidad
            y experimentacion computacional.
          </p>
        </div>
        <div className="grid w-full gap-4 text-base font-medium sm:grid-cols-2">
          <Link
            className="flex min-h-28 flex-col justify-center rounded-lg border border-black/[.08] px-5 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            href="/weighted-set"
          >
            <span className="text-lg text-black dark:text-zinc-50">Weighted Set</span>
            <span className="mt-2 text-sm font-normal text-zinc-600 dark:text-zinc-400">
              Ejemplo de tu companero.
            </span>
          </Link>
          <Link
            className="flex min-h-28 flex-col justify-center rounded-lg bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="/subset-sum"
          >
            <span className="text-lg">Subset Sum</span>
            <span className="mt-2 text-sm font-normal opacity-80">
              Racimos de globos para elevar una cabana.
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
