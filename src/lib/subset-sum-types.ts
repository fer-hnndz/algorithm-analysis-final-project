export interface BalloonCluster {
  readonly id: string;
  readonly name: string;
  readonly balloonCount: number;
  readonly liftKg: number;
  readonly materialWeightKg?: number;
  readonly category: "starter" | "balanced" | "boost" | "special";
}

export interface LiftPlan {
  readonly selectedIds: string[];
  readonly totalLiftKg: number;
  readonly remainingTargetKg: number;
  readonly clusterCount: number;
}

export interface AlgorithmStep {
  readonly phase: "sort" | "greedy" | "stuck" | "repair" | "anchor" | "final";
  readonly title: string;
  readonly description: string;
  readonly selectedIds: string[];
  readonly totalLiftKg: number;
}

export interface SubsetSumResult {
  readonly plan: LiftPlan;
  readonly steps: AlgorithmStep[];
  readonly approximationRatio: number;
  readonly complexity: string;
}

export interface ExactComparison {
  readonly optimal: LiftPlan;
  readonly gap: number;
  readonly targetUsePercent: number;
  readonly optimalUsePercent: number;
}

export interface RankedSubset {
  readonly selectedIds: string[];
  readonly totalLiftKg: number;
  readonly gapKg: number;
  readonly reachesTarget: boolean;
  readonly clusterCount: number;
}

export type LiftItem = BalloonCluster;
