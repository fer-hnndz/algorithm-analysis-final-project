import type { BalloonCluster } from "@/lib/subset-sum-types";

export const densidadAire = 1.225;
export const densidadHelio = 0.1785;
export const volumenGlobo = 0.014; //Use estos valores solo como estandar, siendo el r=0.15m
export const pesoGloboVacio = 0.003; //aproximadamenete un globo de latex tiene un peso de 3g
export const pesoCasaKG = 258000; //valor aproximado que halle en internet

export const liftTtlGloboKG =
  (densidadAire - densidadHelio) * volumenGlobo -
  pesoGloboVacio;

export function calculateClusterLift(
  balloonCount: number,
  pesoMaterialKG = pesoGloboVacio,
): number {
  const safecantGlobos = Math.max(0, Math.round(Number.isFinite(balloonCount) ? balloonCount : 0));
  const safePesoMaterialKg = Math.max(
    0,
    Number.isFinite(pesoMaterialKG) ? pesoMaterialKG : pesoGloboVacio,
  );
  const netLiftPerBalloon =
    (densidadAire - densidadHelio) * volumenGlobo -
    safePesoMaterialKg;
  const totalLiftKg = safecantGlobos * netLiftPerBalloon;

  // The simulator works with whole kilograms: any positive lift is represented
  // by at least 1 kg instead of disappearing when rounded.
  return totalLiftKg > 0 ? Math.max(1, Math.round(totalLiftKg)) : 0;
}

function makeCluster(
  id: string,
  name: string,
  cantGlobos: number,
  category: BalloonCluster["category"],
  pesoMaterialKG = pesoGloboVacio,
): BalloonCluster {
  return {
    id,
    name,
    cantGlobos: cantGlobos,
    liftKg: calculateClusterLift(cantGlobos, pesoMaterialKG),
    pesoMaterialKG: pesoMaterialKG,
    category,
  };
}

export const balloonClusters: BalloonCluster[] = [
  makeCluster("starter", "Racimo del porche", 150000, "starter", 0.0032),
  makeCluster("chimney", "Racimo de chimenea", 220000, "starter", 0.0029),
  makeCluster("window", "Racimo de ventanas", 300000, "balanced", 0.0034),
  makeCluster("roof-small", "Racimo techo norte", 390000, "balanced", 0.0031),
  makeCluster("roof-wide", "Racimo techo amplio", 480000, "balanced", 0.0036),
  makeCluster("adventure", "Racimo aventura", 580000, "boost", 0.0028),
  makeCluster("paradise", "Racimo Cataratas Paraiso", 700000, "boost", 0.003),
  makeCluster("storm", "Racimo contra tormenta", 820000, "boost", 0.0037),
  makeCluster("anchor", "Racimo maestro", 980000, "boost", 0.0032),
  makeCluster("rainbow", "Racimo arcoiris", 1200000, "special", 0.0027),
];

export const clusterCategoryLabels: Record<BalloonCluster["category"], string> = {
  starter: "Ligero",
  balanced: "Estable",
  boost: "Gran empuje",
  special: "Especial",
};

export const defaultBalloonClusters = balloonClusters;
export const categoryLabels = clusterCategoryLabels;
