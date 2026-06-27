import type { BalloonCluster, Subset } from "@/lib/subset-sum-types";

function sortSubsets(a: Subset, b: Subset): number {
  return (
    a.clusterCount - b.clusterCount ||
    a.selectedIds.join("|").localeCompare(b.selectedIds.join("|"))
  );
}

/**
 * Exhaustively explores the include/exclude decision tree and returns every
 * subset whose combined lift equals the target. Its time complexity is
 * O(2^n), as expected for an exact Subset Sum search.
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
  const matches: Subset[] = [];
  const selectedIds: string[] = [];

  function search(index: number, totalLiftKg: number) {
    if (totalLiftKg > target) return;

    if (index === ordered.length) {
      if (totalLiftKg === target) {
        matches.push({
          selectedIds: [...selectedIds],
          totalLiftKg,
          clusterCount: selectedIds.length,
        });
      }
      return;
    }

    search(index + 1, totalLiftKg);

    const cluster = ordered[index];
    selectedIds.push(cluster.id);
    search(index + 1, totalLiftKg + cluster.liftKg);
    selectedIds.pop();
  }

  search(0, 0);
  return matches.sort(sortSubsets);
}
