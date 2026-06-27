"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Phase = "intro" | "video" | "fading" | "menu";

const ALGORITHMS = [
  {
    id: "knapsack",
    number: "01",
    title: "Knapsack",
    subtitle: "La Mudanza de Andy",
    href: "/knapsack",
    image: "/knapsack_assets/Andy_room_backgorud.jpg",
  },
  {
    id: "weighted-set",
    number: "02",
    title: "Weighted Set Cover",
    subtitle: "¿Y ahora qué?",
    href: "/weighted-set",
    image: "/weighted/nemo-ocean.jpg",
  },
  {
    id: "sat",
    number: "03",
    title: "SAT",
    subtitle: "La Sopa de Linguini",
    href: "/sat",
    image: "/sat/menu-bg.jpg",
  },
  {
    id: "subset-sum",
    number: "04",
    title: "Subset Sum",
    subtitle: "La Aventura de Carl",
    href: "/subset-sum",
    image: "/subset-sum/upbg2.jpg",
  },
];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [hovered, setHovered] = useState<string | null>(null);
  const [showLogos, setShowLogos] = useState(false);

  // Trigger fade-in of logos on mount
  useEffect(() => {
    const t = setTimeout(() => setShowLogos(true), 100);
    return () => clearTimeout(t);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────

  const handlePlay = useCallback(async () => {
    setPhase("video");
    // Wait a frame for the video element to be in the DOM
    await new Promise((r) => requestAnimationFrame(r));
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    setPhase("fading");
    setTimeout(() => setPhase("menu"), 1000);
  }, []);

  const skipToMenu = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setPhase("menu");
  }, []);

  // Enter key skips video straight to menu
  useEffect(() => {
    if (phase !== "video") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") skipToMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, skipToMenu]);

  // ── Render: Intro ────────────────────────────────────────────────

  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-black select-none">
        {/* Logos row */}
        <div
          className={`flex items-center gap-12 mb-16 transition-opacity duration-1000 ${
            showLogos ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src="/dvd-logo.png"
            alt="DVD"
            width={160}
            height={80}
            className="object-contain"
            priority
          />
          <Image
            src="/disney-logo.png"
            alt="Disney"
            width={160}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* PLAY button */}
        <button
          onClick={handlePlay}
          className={`group flex flex-col items-center gap-3 transition-opacity duration-1000 ${
            showLogos ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: showLogos ? "0ms" : "0ms" }}
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-white/60 group-hover:border-white transition-colors">
            <svg
              className="w-8 h-8 text-white/80 group-hover:text-white ml-1 transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-white/50 text-sm tracking-widest uppercase group-hover:text-white/80 transition-colors">
            Play
          </span>
        </button>
      </div>
    );
  }

  // ── Render: Video ────────────────────────────────────────────────

  if (phase === "video" || phase === "fading") {
    return (
      <div className={`relative h-screen w-screen bg-black overflow-hidden ${phase === "fading" ? "dvd-fade-out" : ""}`}>
          <video
            ref={videoRef}
            src="/disney-intro-cropped.webm"
            onEnded={handleVideoEnded}
            className="absolute inset-0 w-full h-full object-contain"
          />
        {phase === "video" && (
          <button
            onClick={skipToMenu}
            className="absolute bottom-4 right-4 z-10 rounded-lg bg-black/60 px-6 py-2 text-xl text-white transition-colors hover:bg-black/80"
          >
            Skip
          </button>
        )}
      </div>
    );
  }

  // ── Render: Menu ─────────────────────────────────────────────────

  return (
    <div className="relative h-screen w-screen bg-black/20 overflow-hidden select-none">
      {/* Background images (behind menu) */}
      {ALGORITHMS.map(
        (algo) =>
          hovered === algo.id &&
          algo.image && (
            <div key={algo.id} className="absolute inset-0 -z-10">
              <img
                src={algo.image}
                alt=""
                className="w-full h-full object-cover opacity-40 dvd-fade-in"
              />
            </div>
          ),
      )}

      {/* Content */}
      <div
        ref={menuRef}
        className="relative z-10 h-full w-full flex flex-col p-10"
      >
        {/* Top row: Disney logo left, Películas/NP right */}
        <div className="flex items-start justify-between mb-16">
          <Image
            src="/disney-logo.png"
            alt="Disney"
            width={120}
            height={60}
            className="object-contain"
          />
          <div className="text-right leading-tight">
            <p className="text-white/80 text-xl tracking-wide font-light">
              Películas
            </p>
            <p className="text-white/80 text-xl tracking-wide font-light">NP</p>
          </div>
        </div>

        {/* Problem list */}
        <div className="flex flex-col gap-2 max-w-[50%]">
          {ALGORITHMS.map((algo) => (
            <Link
              key={algo.id}
              href={algo.href}
              onMouseEnter={() => setHovered(algo.id)}
              onMouseLeave={() => setHovered(null)}
              className={`block py-3 px-1 transition-all duration-200 rounded ${
                hovered === algo.id ? "bg-white/5" : ""
              }`}
            >
              <h2
                className={`text-2xl transition-all duration-200 ${
                  hovered === algo.id
                    ? "dvd-text-shadow-hover scale-[1.02]"
                    : "dvd-text-shadow"
                }`}
                style={{ color: "white" }}
              >
                {algo.number}. {algo.title}
              </h2>
              <p
                className={`text-sm mt-0.5 transition-all duration-200 ${
                  hovered === algo.id
                    ? "dvd-text-shadow-hover"
                    : "dvd-text-shadow"
                }`}
                style={{
                  color:
                    hovered === algo.id ? "white" : "rgba(200,200,200,0.8)",
                }}
              >
                {algo.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
