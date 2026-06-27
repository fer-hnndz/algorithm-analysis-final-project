export interface BalloonCluster {
  readonly id: string;
  readonly name: string;
  readonly cantGlobos: number;
  readonly liftKg: number;
  readonly pesoMaterialKG?: number;
  readonly category: "starter" | "balanced" | "boost" | "special";
}

export interface Subset {
  readonly selectedIds: string[];
  readonly totalLiftKg: number;
  readonly clusterCount: number;
}
