import type { BalloonCluster, Subset } from "@/lib/subset-sum-types";

const EXACT_SEARCH_LIMIT = 16;
const FRONTIER_LIMIT = 400;

type PartialSelection = {
  readonly selectedIds: string[];
  readonly totalLiftKg: number;
};

function toExactSubset(selection: PartialSelection): Subset {
  return {
    selectedIds: selection.selectedIds,
    totalLiftKg: selection.totalLiftKg,
    clusterCount: selection.selectedIds.length,
  };
}

function sortSubsets(a: Subset, b: Subset): number {
  return (
    a.clusterCount - b.clusterCount ||
    a.selectedIds.join("|").localeCompare(b.selectedIds.join("|"))
  );
}

/**
 * Finds only subsets whose combined lift is exactly equal to the target.
 * Small inputs are exhaustive; larger inputs use a bounded frontier to keep
 * the simulator responsive while custom clusters are added.
 */
export function findBalloonSubsets(
  items: BalloonCluster[],
  targetKg: number,
): Subset[] {
  if (items.length === 0 || targetKg <= 0) return [];

  const target = Math.round(targetKg);
  const ordered = [...items].sort(
    (a, b) => b.liftKg - a.liftKg || a.id.localeCompare(b.id),
  );
  const matches = new Map<string, Subset>();

  function addMatch(selection: PartialSelection) {
    if (selection.totalLiftKg !== target) return;
    const match = toExactSubset(selection);
    const key = [...match.selectedIds].sort().join("|");
    matches.set(key, match);
  }

  if (ordered.length <= EXACT_SEARCH_LIMIT) {
    const totalMasks = 1 << ordered.length;

    for (let mask = 1; mask < totalMasks; mask++) {
      const selectedIds: string[] = [];
      let totalLiftKg = 0;

      for (let index = 0; index < ordered.length; index++) {
        if ((mask & (1 << index)) === 0) continue;
        selectedIds.push(ordered[index].id);
        totalLiftKg += ordered[index].liftKg;
      }

      addMatch({ selectedIds, totalLiftKg });
    }
  } else {
    let frontier: PartialSelection[] = [{ selectedIds: [], totalLiftKg: 0 }];

    for (const item of ordered) {
      const expanded = frontier.flatMap((selection) => [
        selection,
        {
          selectedIds: [...selection.selectedIds, item.id],
          totalLiftKg: selection.totalLiftKg + item.liftKg,
        },
      ]);

      expanded.forEach(addMatch);

      const bestByState = new Map<string, PartialSelection>();
      for (const selection of expanded) {
        if (selection.totalLiftKg > target) continue;
        const key = `${selection.selectedIds.length}:${selection.totalLiftKg}`;
        if (!bestByState.has(key)) bestByState.set(key, selection);
      }

      frontier = [...bestByState.values()]
        .sort(
          (a, b) =>
            Math.abs(target - a.totalLiftKg) -
              Math.abs(target - b.totalLiftKg) ||
            a.selectedIds.length - b.selectedIds.length,
        )
        .slice(0, FRONTIER_LIMIT);
    }
  }

  return [...matches.values()].sort(sortSubsets);
}
