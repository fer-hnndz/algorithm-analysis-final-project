"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import {
  BALLOON_VOLUME_M3,
  EMPTY_BALLOON_WEIGHT_KG,
  HELIUM_DENSITY_KG_M3,
  AIR_DENSITY_KG_M3,
  NET_LIFT_PER_BALLOON_KG,
  UP_HOUSE_WEIGHT_KG,
  calculateClusterLift,
  categoryLabels,
  defaultBalloonClusters,
} from "@/app/subset-sum/balloon-data";
import { rankBalloonSubsets } from "@/lib/subset-sum-solver";
import type { BalloonCluster } from "@/lib/subset-sum-types";

const categoryClasses: Record<BalloonCluster["category"], string> = {
  starter: "border-sky-300 bg-sky-100 text-sky-950",
  boost: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-950",
  balanced: "border-emerald-300 bg-emerald-100 text-emerald-950",
  special: "border-amber-300 bg-amber-100 text-amber-950",
};

const ASSET_BASE_PATH = "/subset-sum";
const PAGE_BACKGROUND_IMAGE = `${ASSET_BASE_PATH}/upbg2.jpg`;
const INTRO_VIDEO = `${ASSET_BASE_PATH}/videoIntro.mp4`;
const BACKGROUND_MUSIC = `${ASSET_BASE_PATH}/upmedia.mp3`;
const HOUSE_IMAGE = `${ASSET_BASE_PATH}/upHouseBG.png`;
const CHIMNEY_ANCHOR = { x: 49.8, y: 65.5 };
const MIN_BALLOON_COUNT = 1;
const MIN_MATERIAL_WEIGHT_GRAMS = 1;
const MAX_MATERIAL_WEIGHT_GRAMS = 10;
const balloonAssets = [
  {
    src: `${ASSET_BASE_PATH}/1globo.png`,
    minBalloons: 1,
    maxBalloons: 1000,
    label: "1 globo visual",
    points: [{ x: 0, y: 9.8 }],
  },
  {
    src: `${ASSET_BASE_PATH}/3globos.png`,
    minBalloons: 1001,
    maxBalloons: 3000,
    label: "3 globos visuales",
    points: [
      { x: -6.8, y: 6.2 },
      { x: 0, y: 5.5 },
      { x: 6.8, y: 6.2 },
    ],
  },
  {
    src: `${ASSET_BASE_PATH}/4globos.png`,
    minBalloons: 3001,
    maxBalloons: 5000,
    label: "4 globos visuales",
    points: [
      { x: -7.8, y: 5.8 },
      { x: -1.4, y: 5.1 },
      { x: 4.8, y: 7.2 },
      { x: 8.2, y: 3.6 },
    ],
  },
  {
    src: `${ASSET_BASE_PATH}/6globos.png`,
    minBalloons: 5001,
    maxBalloons: Number.POSITIVE_INFINITY,
    label: "6 globos visuales",
    points: [
      { x: -7.2, y: -0.8 },
      { x: -2.8, y: -4.2 },
      { x: 3, y: -2.2 },
      { x: 7.2, y: -3.6 },
      { x: -3.2, y: 7.8 },
      { x: 6.4, y: 7.2 },
    ],
  },
];

function getBalloonAsset(balloonCount: number | undefined) {
  const count = Math.max(1, Math.round(balloonCount ?? 1));
  return (
    balloonAssets.find(
      (asset) => count >= asset.minBalloons && count <= asset.maxBalloons,
    ) ?? balloonAssets[balloonAssets.length - 1]
  );
}

function formatBalloonRange(asset: (typeof balloonAssets)[number]) {
  if (!Number.isFinite(asset.maxBalloons)) {
    return `${asset.minBalloons.toLocaleString("es-HN")} o mas globos`;
  }

  return `${asset.minBalloons.toLocaleString("es-HN")} - ${asset.maxBalloons.toLocaleString("es-HN")} globos`;
}

function formatKg(value: number) {
  return `${Math.round(value).toLocaleString("es-HN")} kg`;
}

function normalizeKg(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function blockNegativeNumberKeys(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "-" || event.key === "+") event.preventDefault();
}

function getSelectedItems(items: BalloonCluster[], ids: Iterable<string>) {
  const selectedIds = new Set(ids);
  return items.filter((item) => selectedIds.has(item.id));
}

function categoryForLift(lift: number): BalloonCluster["category"] {
  if (lift >= 45000) return "boost";
  if (lift >= 26000) return "balanced";
  if (lift >= 12000) return "starter";
  return "special";
}

function getBalloonPosition(index: number, total: number) {
  const columns = Math.min(6, Math.max(4, Math.ceil(Math.sqrt(total * 1.35))));
  const row = Math.floor(index / columns);
  const column = index % columns;
  const itemsInRow = Math.min(columns, total - row * columns);
  const center = (itemsInRow - 1) / 2;
  const stagger = row % 2 === 0 ? 0 : 4.4;
  const rowSpacing = total > 20 ? 7.2 : 8.4;
  const left = 50 + (column - center) * 8.7 + stagger;
  const top = 16 + row * rowSpacing + Math.abs(column - center) * 1.5;
  const densityScale = total > 20 ? 0.78 : total > 14 ? 0.92 : 1.08;
  const scale = Math.max(0.66, densityScale - row * 0.035);

  return {
    left: Math.min(78, Math.max(22, left)),
    top: Math.min(45, top),
    scale,
  };
}

function getBalloonLinePoints(
  left: number,
  top: number,
  scale: number,
  asset: (typeof balloonAssets)[number],
) {
  return asset.points.map((point) => ({
    x: left + point.x * scale,
    y: top + point.y * scale,
  }));
}

export default function SubsetSumPage() {
  const [targetWeight, setTargetWeight] = useState(UP_HOUSE_WEIGHT_KG);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [customClusters, setCustomClusters] = useState<BalloonCluster[]>([]);
  const [balloonCount, setBalloonCount] = useState(1200000);
  const [materialWeightGrams, setMaterialWeightGrams] = useState(3);
  const [musicOn, setMusicOn] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showContext, setShowContext] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const clusters = useMemo(
    () => [...defaultBalloonClusters, ...customClusters],
    [customClusters],
  );

  const rankedResults = useMemo(
    () => rankBalloonSubsets(clusters, targetWeight),
    [clusters, targetWeight],
  );
  const exactResults = rankedResults.filter((candidate) => candidate.gapKg === 0);

  const bestResult = exactResults[0] ?? null;
  const availableLift = clusters.reduce((sum, cluster) => sum + cluster.liftKg, 0);
  const hasEnoughLift = availableLift >= targetWeight;
  const visibleIds = new Set(bestResult?.selectedIds ?? []);
  const displayTotal = bestResult?.totalLiftKg ?? 0;
  const displayRemaining = targetWeight - displayTotal;
  const displayCount = bestResult?.clusterCount ?? 0;
  const finalUse = targetWeight === 0 ? 0 : Math.round((displayTotal / targetWeight) * 100);
  const focusedCluster = focusedId
    ? clusters.find((cluster) => cluster.id === focusedId)
    : null;
  const materialWeightKg = materialWeightGrams / 1000;
  const previewLift = calculateClusterLift(balloonCount, materialWeightKg);
  const previewBalloonAsset = getBalloonAsset(balloonCount);
  const sceneClusters = clusters;

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      audio?.pause();
    };
  }, []);

  function updateTarget(value: number) {
    setTargetWeight(normalizeKg(value));
  }

  function updateBalloonCount(value: number) {
    if (!Number.isFinite(value)) return;
    setBalloonCount(Math.max(MIN_BALLOON_COUNT, Math.round(value)));
  }

  function updateMaterialWeight(value: number) {
    if (!Number.isFinite(value)) return;
    setMaterialWeightGrams(
      Math.min(
        MAX_MATERIAL_WEIGHT_GRAMS,
        Math.max(MIN_MATERIAL_WEIGHT_GRAMS, Math.round(value)),
      ),
    );
  }

  function addCustomCluster() {
    const lift = previewLift;
    const nextIndex = customClusters.length + 1;

    setCustomClusters((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        name: `Racimo personalizado ${nextIndex}`,
        liftKg: lift,
        category: categoryForLift(lift),
        balloonCount,
        materialWeightKg,
      },
    ]);
  }

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicOn) {
      audio.pause();
      setMusicOn(false);
      return;
    }

    audio.volume = 0.35;
    void audio.play().then(() => setMusicOn(true));
  }

  return (
    <main
      className="relative h-screen overflow-hidden bg-center bg-no-repeat p-3 text-slate-950 sm:p-4 lg:p-6"
      style={{
        backgroundImage: `url(${PAGE_BACKGROUND_IMAGE})`,
        backgroundSize: "cover",
      }}
    >
      <audio ref={audioRef} src={BACKGROUND_MUSIC} loop preload="none" />
      <style>{`
        @keyframes sky-drift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes cloud-run {
          from { transform: translateX(-28vw); }
          to { transform: translateX(118vw); }
        }

        @keyframes lift-float {
          0%, 100% { transform: translate3d(0, 8px, 0) rotate(-0.6deg); }
          50% { transform: translate3d(0, -10px, 0) rotate(0.6deg); }
        }

        @keyframes bundle-float {
          0%, 100% {
            transform: translate3d(-50%, -50%, 0) translateY(0) rotate(-1.2deg) scale(var(--base-bundle-scale));
          }
          50% {
            transform: translate3d(-50%, -50%, 0) translateY(-7px) rotate(1.2deg) scale(var(--base-bundle-scale));
          }
        }

        .cloud {
          position: absolute;
          width: 180px;
          height: 48px;
          border-radius: 999px;
          background: rgba(255,255,255,0.78);
          filter: drop-shadow(0 12px 18px rgba(66, 153, 225, 0.14));
          animation: cloud-run linear infinite;
        }

        .cloud::before,
        .cloud::after {
          content: "";
          position: absolute;
          border-radius: 999px;
          background: inherit;
        }

        .cloud::before {
          width: 82px;
          height: 82px;
          left: 26px;
          bottom: 12px;
        }

        .cloud::after {
          width: 105px;
          height: 105px;
          right: 24px;
          bottom: 4px;
        }

        .lift-rig {
          animation: lift-float 7.2s ease-in-out infinite;
          transform: translateZ(0);
          will-change: transform;
        }

        .balloon-bundle {
          animation: bundle-float 5.8s ease-in-out infinite;
          animation-delay: var(--bundle-delay);
          transform: translate3d(-50%, -50%, 0) scale(var(--base-bundle-scale));
          will-change: transform;
        }

        .balloon-bundle:hover,
        .balloon-bundle:focus-visible {
          --base-bundle-scale: var(--hover-bundle-scale);
          filter:
            drop-shadow(0 0 14px rgba(255, 245, 157, 0.9))
            drop-shadow(0 14px 16px rgba(8, 47, 73, 0.26))
            saturate(1.2)
            brightness(1.16);
        }

        .scene-glass {
          background:
            radial-gradient(circle at 52% 16%, rgba(255, 255, 255, 0.48), transparent 22%),
            linear-gradient(180deg, rgba(125, 211, 252, 0.94) 0%, rgba(56, 189, 248, 0.88) 48%, rgba(14, 116, 144, 0.9) 100%);
        }

        .up-panel {
          background:
            radial-gradient(circle at 20% 0%, rgba(255, 213, 79, 0.28), transparent 34%),
            radial-gradient(circle at 90% 18%, rgba(244, 114, 182, 0.24), transparent 32%),
            linear-gradient(180deg, rgba(7, 121, 151, 0.9), rgba(5, 84, 112, 0.86) 52%, rgba(3, 54, 82, 0.88));
          border: 2px solid rgba(125, 211, 252, 0.92);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.12) inset,
            0 0 24px rgba(56, 189, 248, 0.46),
            0 0 42px rgba(250, 204, 21, 0.16),
            0 24px 70px rgba(2, 6, 23, 0.52);
        }

        .up-panel-card {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.1)),
            linear-gradient(135deg, rgba(250, 204, 21, 0.08), rgba(56, 189, 248, 0.06));
          border: 1px solid rgba(224, 242, 254, 0.42);
          box-shadow: 0 12px 28px rgba(2, 44, 67, 0.22);
          backdrop-filter: blur(10px);
        }
      `}</style>

      <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" />

      {showIntro ? (
        <section className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <video
            className="h-full w-full object-cover"
            src={INTRO_VIDEO}
            autoPlay
            muted
            controls
            playsInline
            onEnded={() => setShowIntro(false)}
          />
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="absolute right-5 top-5 rounded-full border border-white/30 bg-black/45 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
          >
            Saltar intro
          </button>
        </section>
      ) : null}

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col gap-4">
        <header className="shrink-0 rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-white shadow-2xl backdrop-blur-md sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-black text-white shadow-sm backdrop-blur transition hover:bg-white/20"
              >
                Atras
              </Link>
              <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-white md:text-5xl">
                Elevando la Casa
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-sky-50 md:text-base">
                Simulador inspirado en Up: cada racimo aporta elevacion neta calculada con
                Arquimedes. El reto es encontrar combinaciones de globos que alcancen o casi
                alcancen el peso de la cabana con la menor cantidad posible de racimos.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleMusic}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cyan-200/50 bg-cyan-950/45 text-xl font-black text-white shadow-[0_0_18px_rgba(103,232,249,0.35)] backdrop-blur transition hover:bg-cyan-500/25"
              aria-label={musicOn ? "Silenciar musica" : "Reproducir musica"}
            >
              {musicOn ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M4 9v6h4l5 4V5L8 9H4Z"
                    fill="currentColor"
                  />
                  <path
                    d="M16 8.5c1 .9 1.5 2.1 1.5 3.5S17 14.6 16 15.5M18.4 6c1.7 1.5 2.6 3.6 2.6 6s-.9 4.5-2.6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M4 9v6h4l5 4V5L8 9H4Z"
                    fill="currentColor"
                  />
                  <path
                    d="m17 9 4 4m0-4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
          <section className="scene-glass relative min-h-0 overflow-hidden rounded-lg border border-white/20 shadow-2xl backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-300/30 via-cyan-500/20 to-cyan-950/45" />
            <span className="cloud left-0 top-[16%] opacity-45" style={{ animationDuration: "38s" }} />
            <span className="cloud left-0 top-[55%] scale-75 opacity-35" style={{ animationDuration: "48s", animationDelay: "-18s" }} />

            <div className="lift-rig absolute inset-0">
              <div className="absolute inset-0 z-20">
                {sceneClusters.map((cluster, index) => {
                const selected = visibleIds.has(cluster.id);
                const position = getBalloonPosition(index, sceneClusters.length);
                const asset = getBalloonAsset(cluster.balloonCount);
                return (
                  <button
                    key={cluster.id}
                    type="button"
                    onClick={() => setFocusedId(cluster.id)}
                    onMouseEnter={() => setFocusedId(cluster.id)}
                    onMouseLeave={() =>
                      setFocusedId((current) => (current === cluster.id ? null : current))
                    }
                    onFocus={() => setFocusedId(cluster.id)}
                    onBlur={() =>
                      setFocusedId((current) => (current === cluster.id ? null : current))
                    }
                    className={`balloon-bundle absolute h-28 w-28 transition duration-200 hover:z-30 hover:brightness-110 focus:z-30 focus:outline-none focus:ring-4 focus:ring-white/70 sm:h-32 sm:w-32 lg:h-40 lg:w-40 ${
                      selected
                        ? "z-20 brightness-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.85)]"
                        : "opacity-80 saturate-90 disabled:opacity-25"
                    }`}
                    style={{
                      left: `${position.left}%`,
                      top: `${position.top}%`,
                      "--base-bundle-scale": position.scale,
                      "--hover-bundle-scale": position.scale * 1.24,
                      "--bundle-delay": `${(index % 9) * -0.36}s`,
                    } as CSSProperties}
                    aria-label={`${cluster.name}, ${formatKg(cluster.liftKg)}`}
                  >
                    <Image
                      src={asset.src}
                      alt=""
                      fill
                      sizes="180px"
                      loading="eager"
                      className="object-contain"
                    />
                    <span className="sr-only">{cluster.name}</span>
                  </button>
                );
              })}
              </div>

              <svg
                className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                {sceneClusters.map((cluster, index) => {
                const position = getBalloonPosition(index, sceneClusters.length);
                const asset = getBalloonAsset(cluster.balloonCount);
                return getBalloonLinePoints(
                  position.left,
                  position.top,
                  position.scale,
                  asset,
                ).map((point, pointIndex) => (
                    <line
                      key={`${cluster.id}-${pointIndex}`}
                      x1={point.x}
                      y1={point.y}
                      x2={CHIMNEY_ANCHOR.x}
                      y2={CHIMNEY_ANCHOR.y}
                      stroke={visibleIds.has(cluster.id) ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.3)"}
                      strokeWidth={visibleIds.has(cluster.id) ? "0.2" : "0.1"}
                    />
                  ));
              })}
            </svg>

              <div className="absolute bottom-4 left-1/2 z-20 h-[36%] w-[62%] -translate-x-1/2 sm:bottom-8">
              <Image
                  src={HOUSE_IMAGE}
                alt="Cabana elevada por globos"
                fill
                  sizes="420px"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
            </div>

            {focusedCluster && (
                <div className="pointer-events-none absolute bottom-4 left-4 z-30 w-72 rounded-lg border border-white/15 bg-black/60 p-4 text-sm text-white shadow-xl backdrop-blur">
                  <p className="text-lg font-black">{focusedCluster.name}</p>
                  <p className="mt-1 text-sky-100">
                    {focusedCluster.balloonCount.toLocaleString("es-HN")} globos
                    {focusedCluster.materialWeightKg != null
                      ? ` | ${Math.round(focusedCluster.materialWeightKg * 1000).toLocaleString("es-HN")} g material`
                      : ""}
                  </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full border px-2 py-1 text-xs font-black ${categoryClasses[focusedCluster.category]}`}>
                    {categoryLabels[focusedCluster.category]}
                  </span>
                  <span className="text-xl font-black text-fuchsia-700">
                    {formatKg(focusedCluster.liftKg)}
                  </span>
                </div>
              </div>
            )}
        </section>

          <aside className="up-panel relative z-20 min-h-0 rounded-lg text-white backdrop-blur-md">
            <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto px-5 py-5">
            <section className="up-panel-card rounded-lg p-4">
              <label htmlFor="target-weight" className="text-sm font-black uppercase text-cyan-50">
                Peso objetivo de elevacion
              </label>
              <input
                id="target-weight"
                type="range"
                min={1000}
                max={600000}
                step={1000}
                value={targetWeight}
                onChange={(event) => updateTarget(Number(event.target.value))}
                className="mt-3 w-full accent-fuchsia-600"
              />
              <div className="mt-3 flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2">
                <input
                  type="number"
                  min={0}
                  max={2000000}
                  step={1000}
                  value={targetWeight}
                  onChange={(event) => updateTarget(Number(event.target.value))}
                  onKeyDown={blockNegativeNumberKeys}
                  className="w-full bg-transparent text-lg font-black text-slate-950 outline-none"
                  aria-label="Ingresar peso objetivo"
                />
                <span className="text-sm font-black text-fuchsia-700">kg</span>
              </div>
            </section>

            <section className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Elevacion", value: Math.round(displayTotal).toLocaleString("es-HN") },
                { label: displayRemaining < 0 ? "Exceso" : "Faltante", value: Math.abs(Math.round(displayRemaining)).toLocaleString("es-HN") },
                { label: "Racimos", value: displayCount },
              ].map((stat) => (
                <div key={stat.label} className="up-panel-card rounded-lg p-3">
                  <p className="text-xs font-black uppercase text-yellow-100">{stat.label}</p>
                  <p className="mt-1 text-2xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </section>

            <section className="up-panel-card rounded-lg p-4">
              <h2 className="text-lg font-black uppercase text-white">Agregar racimo</h2>
              <label htmlFor="balloon-count" className="mt-3 block text-sm font-black text-cyan-50">
                Cantidad de globos
              </label>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <input
                  id="balloon-count"
                  type="number"
                  min={MIN_BALLOON_COUNT}
                  step={1}
                  value={balloonCount}
                  onChange={(event) => updateBalloonCount(Number(event.target.value))}
                  onKeyDown={blockNegativeNumberKeys}
                  className="min-w-0 flex-1 rounded-md border border-cyan-100/50 bg-white/90 px-3 py-2 font-black text-slate-950 outline-none focus:border-yellow-300"
                />
                <button
                  type="button"
                  onClick={addCustomCluster}
                  className="rounded-md bg-yellow-400 px-3 py-2 text-sm font-black text-cyan-950 transition hover:bg-yellow-300"
                >
                  Agregar
                </button>
              </div>
              <label htmlFor="material-weight" className="mt-3 block text-sm font-black text-cyan-50">
                Peso del material por globo
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-md border border-cyan-100/50 bg-white/90 px-3 py-2">
                <input
                  id="material-weight"
                  type="number"
                  min={MIN_MATERIAL_WEIGHT_GRAMS}
                  max={MAX_MATERIAL_WEIGHT_GRAMS}
                  step={1}
                  value={materialWeightGrams}
                  onChange={(event) => updateMaterialWeight(Number(event.target.value))}
                  onKeyDown={blockNegativeNumberKeys}
                  className="min-w-0 flex-1 bg-transparent font-black text-slate-950 outline-none"
                />
                <span className="text-sm font-black text-fuchsia-700">g</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-cyan-50">
                Elevacion calculada: <strong>{formatKg(previewLift)}</strong>.
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-md border border-yellow-200/40 bg-cyan-950/30 p-3">
                <div className="relative h-14 w-14 shrink-0">
                  <Image
                    src={previewBalloonAsset.src}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 text-xs leading-5 text-cyan-50">
                  <p className="font-black text-yellow-100">
                    {previewBalloonAsset.label}
                  </p>
                  <p>Rango: {formatBalloonRange(previewBalloonAsset)}</p>
                </div>
              </div>
              <div className="mt-3 rounded-md border border-cyan-100/30 bg-cyan-950/30 p-3 text-xs leading-5 text-cyan-50">
                <p className="font-black">Calculo transparente</p>
                <p className="mt-1">
                  {balloonCount.toLocaleString("es-HN")} x [(densidad aire - densidad helio)
                  x volumen - {Math.round(materialWeightGrams).toLocaleString("es-HN")} g] ={" "}
                  {previewLift.toLocaleString("es-HN")} kg.
                </p>
              </div>
            </section>

            <section className="up-panel-card rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black uppercase text-white">Resultados</h2>
                  <p className="mt-1 text-sm leading-6 text-cyan-50">
                    Solo aparecen subconjuntos cuya elevacion total coincide exactamente con
                    la meta, ordenados desde la menor cantidad de racimos.
                  </p>
                </div>
                <span className="rounded-md bg-yellow-300 px-2 py-1 text-xs font-black text-cyan-950">
                  {finalUse}%
                </span>
              </div>

              <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                {!hasEnoughLift ? (
                  <div className="rounded-md border border-yellow-200/60 bg-yellow-300/15 p-3 text-sm leading-5 text-yellow-50">
                    <p className="font-black">Elevacion disponible insuficiente</p>
                    <p className="mt-1">
                      Todos los racimos suman {formatKg(availableLift)}. Agrega otro racimo o
                      reduce la meta; mientras sea mayor, las combinaciones mas fuertes pueden
                      repetirse aunque cambie el faltante.
                    </p>
                  </div>
                ) : null}
                {exactResults.length === 0 ? (
                  <div className="rounded-md border border-cyan-100/30 bg-cyan-950/28 p-4 text-center text-sm leading-6 text-cyan-50">
                    <p className="font-black text-white">Sin coincidencias exactas</p>
                    <p className="mt-1">
                      Agrega racimos o cambia la meta hasta formar una suma exacta.
                    </p>
                  </div>
                ) : null}
                {exactResults.map((candidate, index) => {
                  const items = getSelectedItems(clusters, candidate.selectedIds);

                  return (
                    <button
                      key={`${candidate.clusterCount}-${candidate.totalLiftKg}-${candidate.selectedIds.join("-")}`}
                      type="button"
                      onClick={() => setFocusedId(items[0]?.id ?? null)}
                      className={`w-full rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:border-yellow-200 hover:bg-white/18 ${
                        index === 0
                          ? "border-yellow-200 bg-yellow-300/20"
                          : "border-cyan-100/30 bg-cyan-950/28"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black uppercase text-yellow-100">
                          #{index + 1} | {candidate.clusterCount} racimos
                        </p>
                        <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-black text-cyan-950">
                          exacto
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="block text-xs font-black uppercase text-cyan-100">
                            Elevacion
                          </span>
                          <strong className="text-white">{formatKg(candidate.totalLiftKg)}</strong>
                        </p>
                        <p>
                          <span className="block text-xs font-black uppercase text-cyan-100">
                            Diferencia
                          </span>
                          <strong className="text-white">{formatKg(candidate.gapKg)}</strong>
                        </p>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-cyan-50">
                        {items.map((item) => item.name).join(", ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="up-panel-card rounded-lg p-4">
              <h2 className="text-lg font-black uppercase text-white">Fisica del globo</h2>
              <p className="mt-2 text-sm leading-6 text-cyan-50">
                Cada racimo usa: n x [({AIR_DENSITY_KG_M3} - {HELIUM_DENSITY_KG_M3}) x{" "}
                {BALLOON_VOLUME_M3} - peso material].
              </p>
              <p className="mt-2 text-sm leading-6 text-cyan-50">
                El peso del material es un buen factor variable: cambia por latex, plastico,
                nudo, cinta o cuerda, y afecta directamente la elevacion neta sin complicar
                demasiado el modelo.
              </p>
              <p className="mt-2 text-sm leading-6 text-cyan-50">
                Con {Math.round(EMPTY_BALLOON_WEIGHT_KG * 1000).toLocaleString("es-HN")} g de
                material, cada globo aporta cerca de{" "}
                <strong>{Math.round(NET_LIFT_PER_BALLOON_KG * 1000).toLocaleString("es-HN")} g</strong>.
              </p>
              <p className="mt-2 text-sm font-black text-yellow-100">
                El algoritmo conserva una esencia propia: agrupa la mejor alternativa por
                cantidad de racimos y prioriza alcanzar la meta, menor brecha y menor exceso.
              </p>
            </section>
          </div>
        </aside>
      </div>
      </div>

      {!showIntro && showContext ? (
        <section className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="relative flex w-full max-w-4xl items-end justify-center">
            <div className="relative max-w-3xl rounded-[28px] border-2 border-cyan-200/80 bg-white/92 p-6 text-cyan-950 shadow-[0_0_36px_rgba(103,232,249,0.55)] backdrop-blur sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-fuchsia-700">
                Mision de despegue
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-cyan-950 sm:text-4xl">
                Necesitamos levantar la casa con la menor cantidad de racimos.
              </h2>
              <p className="mt-4 text-base font-semibold leading-7 text-cyan-900">
                La meta inicial usa como referencia los 258,000 kg de la casa de Up. Cada
                racimo se calcula siempre con la formula fisica, usando la cantidad de globos y
                el peso del material que elijas. El simulador ordena las combinaciones desde la
                que usa menos racimos hasta las que usan mas.
              </p>
              <p className="mt-3 text-sm leading-6 text-cyan-900/90">
                Para que los racimos no sean identicos, el peso del material cambia la
                elevacion final: un globo mas pesado aporta menos fuerza neta, aunque tenga el
                mismo volumen de helio.
              </p>
              <button
                type="button"
                onClick={() => setShowContext(false)}
                className="mt-6 rounded-md bg-yellow-300 px-5 py-3 text-sm font-black uppercase text-cyan-950 shadow-lg transition hover:bg-yellow-200"
              >
                Iniciar simulador
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
