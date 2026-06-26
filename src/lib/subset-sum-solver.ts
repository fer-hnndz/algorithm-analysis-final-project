import type {
  AlgorithmStep,
  ExactComparison,
  LiftPlan,
  LiftItem,
  RankedSubset,
  SubsetSumResult,
} from "@/lib/subset-sum-types";

const EPSILON = 0.000001;

function roundKg(value: number): number {
  return Math.round(value * 10) / 10;
}

function itemLift(item: LiftItem): number {
  return item.liftKg;
}

function itemCountLabel(item: LiftItem): string {
  return `${item.balloonCount.toLocaleString("es-HN")} globos`;
}

function toPlan(items: LiftItem[], targetKg: number): LiftPlan {
  const totalLiftKg = roundKg(
    items.reduce((sum, item) => sum + itemLift(item), 0),
  );
  const remainingTargetKg = roundKg(targetKg - totalLiftKg);

  return {
    selectedIds: items.map((item) => item.id),
    totalLiftKg,
    remainingTargetKg,
    clusterCount: items.length,
  };
}

function isBetterPlan(candidate: LiftPlan, current: LiftPlan): boolean {
  if (Math.abs(candidate.totalLiftKg - current.totalLiftKg) > EPSILON) {
    return candidate.totalLiftKg > current.totalLiftKg;
  }

  if (candidate.clusterCount !== current.clusterCount) {
    return candidate.clusterCount > current.clusterCount;
  }

  return candidate.selectedIds.join("|") < current.selectedIds.join("|");
}

function addStep(
  steps: AlgorithmStep[],
  phase: AlgorithmStep["phase"],
  title: string,
  description: string,
  selected: LiftItem[],
  targetKg: number,
) {
  const plan = toPlan(selected, targetKg);
  steps.push({
    phase,
    title,
    description,
    selectedIds: plan.selectedIds,
    totalLiftKg: plan.totalLiftKg,
  });
}

function findLargestAffordable<T extends LiftItem>(items: T[], targetKg: number): T[] {
  const affordable = items.filter((item) => itemLift(item) <= targetKg);
  if (affordable.length === 0) return [];

  return [
    affordable.reduce((best, item) =>
      itemLift(item) > itemLift(best) ? item : best,
    ),
  ];
}

function repairWithLocalSwaps<T extends LiftItem>(
  selected: T[],
  unselected: T[],
  targetKg: number,
  steps: AlgorithmStep[],
): T[] {
  let current = [...selected];
  let improved = true;

  while (improved) {
    improved = false;
    const currentIds = new Set(current.map((cluster) => cluster.id));
    const currentPlan = toPlan(current, targetKg);
    let bestPlan = currentPlan;
    let bestSelection = current;
    let bestDescription = "";
    const pool = unselected.filter((cluster) => !currentIds.has(cluster.id));

    for (const removed of current) {
      const base = current.filter((cluster) => cluster.id !== removed.id);

      for (let i = 0; i < pool.length; i++) {
        const oneSwap = [...base, pool[i]];
        const onePlan = toPlan(oneSwap, targetKg);
        if (onePlan.totalLiftKg <= targetKg + EPSILON && isBetterPlan(onePlan, bestPlan)) {
          bestPlan = onePlan;
          bestSelection = oneSwap;
          bestDescription = `Se cambia ${removed.name} por ${pool[i].name}.`;
        }

        for (let j = i + 1; j < pool.length; j++) {
          const twoSwap = [...base, pool[i], pool[j]];
          const twoPlan = toPlan(twoSwap, targetKg);
          if (twoPlan.totalLiftKg <= targetKg + EPSILON && isBetterPlan(twoPlan, bestPlan)) {
            bestPlan = twoPlan;
            bestSelection = twoSwap;
            bestDescription = `Se cambia ${removed.name} por ${pool[i].name} y ${pool[j].name}.`;
          }
        }
      }
    }

    if (isBetterPlan(bestPlan, currentPlan)) {
      current = bestSelection;
      improved = true;
      addStep(
        steps,
        "repair",
        "Reparacion local",
        `${bestDescription} La seleccion mejora a ${bestPlan.totalLiftKg} kg.`,
        current,
        targetKg,
      );
    }
  }

  return current;
}

export function solveBalloonSubsetSum<T extends LiftItem>(
  items: T[],
  targetKg: number,
): SubsetSumResult {
  const steps: AlgorithmStep[] = [];
  if (targetKg <= 0 || items.length === 0) {
    const empty = toPlan([], Math.max(0, targetKg));
    return {
      plan: empty,
      steps: [
        {
          phase: "final",
          title: "Sin presupuesto",
          description: "No hay racimos seleccionables con este peso objetivo.",
          selectedIds: [],
          totalLiftKg: 0,
        },
      ],
      approximationRatio: 0.5,
      complexity: "O(n^3) por la reparacion local con intercambios de hasta dos racimos.",
    };
  }

  const ordered = [...items].sort((a, b) => itemLift(a) - itemLift(b) || a.name.localeCompare(b.name));
  addStep(
    steps,
    "sort",
    "Ordenamiento inicial",
    "Los racimos se ordenan por elevacion neta ascendente para llenar el objetivo con margen controlado.",
    [],
    targetKg,
  );

  const selected: T[] = [];
  const unselected: T[] = [];

  for (const item of ordered) {
    const candidate = [...selected, item];
    const candidatePlan = toPlan(candidate, targetKg);
    if (candidatePlan.totalLiftKg <= targetKg + EPSILON) {
      selected.push(item);
      addStep(
        steps,
        "greedy",
        `Greedy agrega ${item.name}`,
        `Elevacion acumulada: ${candidatePlan.totalLiftKg} kg. Margen restante: ${candidatePlan.remainingTargetKg} kg. ${itemCountLabel(item)}.`,
        selected,
        targetKg,
      );
    } else {
      unselected.push(item);
    }
  }

  addStep(
    steps,
    "stuck",
    "Punto de atasco",
    "Ya no cabe ningun racimo restante sin exceder el peso objetivo.",
    selected,
    targetKg,
  );

  const repaired = repairWithLocalSwaps(selected, unselected, targetKg, steps);
  const repairedPlan = toPlan(repaired, targetKg);
  const anchor = findLargestAffordable(items, targetKg);
  const anchorPlan = toPlan(anchor, targetKg);
  addStep(
    steps,
    "anchor",
    "Ancla de aproximacion",
    "Se compara la solucion reparada contra el racimo individual con mayor elevacion que no excede el objetivo.",
    anchor,
    targetKg,
  );

  const finalSelection = isBetterPlan(anchorPlan, repairedPlan) ? anchor : repaired;
  const finalPlan = toPlan(finalSelection, targetKg);

  addStep(
    steps,
    "final",
    "Combinacion sugerida",
    `La seleccion final logra ${finalPlan.totalLiftKg} kg de ${targetKg} kg y deja ${finalPlan.remainingTargetKg} kg de margen.`,
    finalSelection,
    targetKg,
  );

  return {
    plan: finalPlan,
    steps,
    approximationRatio: 0.5,
    complexity: "O(n log n + n^3): ordenamiento mas busqueda local de intercambios 1-por-1 y 1-por-2.",
  };
}

export function solveBalloonSubsetSumExact<T extends LiftItem>(
  items: T[],
  targetKg: number,
): LiftPlan {
  let best = toPlan([], targetKg);
  const totalMasks = 1 << items.length;

  for (let mask = 1; mask < totalMasks; mask++) {
    const selected: T[] = [];
    for (let index = 0; index < items.length; index++) {
      if ((mask & (1 << index)) !== 0) {
        selected.push(items[index]);
      }
    }

    const candidate = toPlan(selected, targetKg);
    if (candidate.totalLiftKg <= targetKg + EPSILON && isBetterPlan(candidate, best)) {
      best = candidate;
    }
  }

  return best;
}

export function compareWithExact(
  items: LiftItem[],
  targetKg: number,
): ExactComparison {
  const heuristic = solveBalloonSubsetSum(items, targetKg).plan;
  const optimal = solveBalloonSubsetSumExact(items, targetKg);

  return {
    optimal,
    gap: optimal.totalLiftKg - heuristic.totalLiftKg,
    targetUsePercent: targetKg === 0 ? 0 : Math.round((heuristic.totalLiftKg / targetKg) * 100),
    optimalUsePercent: targetKg === 0 ? 0 : Math.round((optimal.totalLiftKg / targetKg) * 100),
  };
}

function isBetterRanked(candidate: RankedSubset, current: RankedSubset): boolean {
  if (candidate.reachesTarget !== current.reachesTarget) {
    return candidate.reachesTarget;
  }

  if (candidate.gapKg !== current.gapKg) {
    return candidate.gapKg < current.gapKg;
  }

  if (candidate.totalLiftKg !== current.totalLiftKg) {
    return candidate.reachesTarget
      ? candidate.totalLiftKg < current.totalLiftKg
      : candidate.totalLiftKg > current.totalLiftKg;
  }

  return candidate.selectedIds.join("|") < current.selectedIds.join("|");
}

export function rankBalloonSubsets(
  items: LiftItem[],
  targetKg: number,
): RankedSubset[] {
  if (items.length === 0 || targetKg <= 0) return [];

  const ordered = [...items].sort(
    (a, b) => itemLift(b) - itemLift(a) || a.name.localeCompare(b.name),
  );
  // Above 16 clusters, exhaustive enumeration starts blocking the animation.
  // The bounded frontier keeps the custom ranking responsive as the list grows.
  const exactLimit = 16;
  const bestByCount = new Map<number, RankedSubset>();

  function addCandidate(selected: LiftItem[]) {
    const totalLiftKg = Math.round(
      selected.reduce((sum, item) => sum + itemLift(item), 0),
    );
    const candidate: RankedSubset = {
      selectedIds: selected.map((item) => item.id),
      totalLiftKg,
      gapKg: Math.abs(targetKg - totalLiftKg),
      reachesTarget: totalLiftKg >= targetKg,
      clusterCount: selected.length,
    };
    const current = bestByCount.get(candidate.clusterCount);
    if (!current || isBetterRanked(candidate, current)) {
      bestByCount.set(candidate.clusterCount, candidate);
    }
  }

  if (ordered.length <= exactLimit) {
    const totalMasks = 1 << ordered.length;
    for (let mask = 1; mask < totalMasks; mask++) {
      const selected: LiftItem[] = [];
      for (let index = 0; index < ordered.length; index++) {
        if ((mask & (1 << index)) !== 0) selected.push(ordered[index]);
      }
      addCandidate(selected);
    }
  } else {
    type PartialSelection = {
      selected: LiftItem[];
      total: number;
      ids: string;
    };
    let frontier: PartialSelection[] = [{ selected: [], total: 0, ids: "" }];
    const beamWidth = 240;

    for (const item of ordered) {
      const expanded = [
        ...frontier,
        ...frontier.map((entry) => ({
          selected: [...entry.selected, item],
          total: entry.total + itemLift(item),
          ids: `${entry.ids}|${item.id}`,
        })),
      ];
      const seen = new Set<string>();
      frontier = expanded
        .filter((entry) => {
          const key = `${entry.selected.length}:${Math.round(entry.total)}:${entry.ids}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .sort((a, b) => {
          const gapA = Math.abs(targetKg - a.total);
          const gapB = Math.abs(targetKg - b.total);
          return (
            a.selected.length - b.selected.length ||
            gapA - gapB ||
            Math.abs(a.total - targetKg) - Math.abs(b.total - targetKg)
          );
        })
        .slice(0, beamWidth);
    }

    frontier
      .filter((entry) => entry.selected.length > 0)
      .forEach((entry) => addCandidate(entry.selected));
  }

  return [...bestByCount.values()].sort((a, b) => {
    if (a.clusterCount !== b.clusterCount) return a.clusterCount - b.clusterCount;
    if (a.gapKg !== b.gapKg) return a.gapKg - b.gapKg;
    return b.totalLiftKg - a.totalLiftKg;
  });
}
