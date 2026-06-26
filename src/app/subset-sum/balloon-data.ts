import type { BalloonCluster } from "@/lib/subset-sum-types";

export const AIR_DENSITY_KG_M3 = 1.225;
export const HELIUM_DENSITY_KG_M3 = 0.1785;
export const BALLOON_VOLUME_M3 = 0.014;
export const EMPTY_BALLOON_WEIGHT_KG = 0.003;
export const UP_HOUSE_WEIGHT_KG = 258000;

export const NET_LIFT_PER_BALLOON_KG =
  (AIR_DENSITY_KG_M3 - HELIUM_DENSITY_KG_M3) * BALLOON_VOLUME_M3 -
  EMPTY_BALLOON_WEIGHT_KG;

export function calculateClusterLift(
  balloonCount: number,
  materialWeightKg = EMPTY_BALLOON_WEIGHT_KG,
): number {
  const safeBalloonCount = Math.max(0, Math.round(Number.isFinite(balloonCount) ? balloonCount : 0));
  const safeMaterialWeightKg = Math.max(
    0,
    Number.isFinite(materialWeightKg) ? materialWeightKg : EMPTY_BALLOON_WEIGHT_KG,
  );
  const netLiftPerBalloon =
    (AIR_DENSITY_KG_M3 - HELIUM_DENSITY_KG_M3) * BALLOON_VOLUME_M3 -
    safeMaterialWeightKg;
  const totalLiftKg = safeBalloonCount * netLiftPerBalloon;

  // The simulator works with whole kilograms: any positive lift is represented
  // by at least 1 kg instead of disappearing when rounded.
  return totalLiftKg > 0 ? Math.max(1, Math.round(totalLiftKg)) : 0;
}

function makeCluster(
  id: string,
  name: string,
  balloonCount: number,
  category: BalloonCluster["category"],
  materialWeightKg = EMPTY_BALLOON_WEIGHT_KG,
): BalloonCluster {
  return {
    id,
    name,
    balloonCount,
    liftKg: calculateClusterLift(balloonCount, materialWeightKg),
    materialWeightKg,
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
