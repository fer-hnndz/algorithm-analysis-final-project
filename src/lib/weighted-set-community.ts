import type { IdentifiedSet, CoverProposal } from "@/lib/weighted-set-types";

const MAX_PRIORITY = 999999;

class PriorityQueue {
  private items: { id: number; priority: number }[] = [];

  addtask(id: number, priority: number) {
    this.items.push({ id, priority });
  }

  poptask(): number {
    let minIdx = 0;
    for (let i = 1; i < this.items.length; i++) {
      if (this.items[i].priority < this.items[minIdx].priority) {
        minIdx = i;
      }
    }
    const [item] = this.items.splice(minIdx, 1);
    return item.id;
  }
}

/**
 * Community-weighted set cover — greedy algorithm.
 *
 * Translated from Zhiyang Su's Python implementation (GPL v2).
 *
 * Picks the most cost-effective set each iteration:
 *   min( cost[s] / |remaining-target-elements-in-s| )
 *
 * Adapted to only cover the given `targetElements` rather than the full
 * universe of all elements across all sets.
 *
 * **Complexity:** O(|U| * |S|) practical.
 *
 * **Note:** This is a greedy approximation — it does NOT guarantee the
 * optimal (lowest-cost) solution, unlike the BFS exact solver.
 *
 * @returns A single-element array with the greedy result, or empty if
 *          no cover exists.
 */
export function communitySolveWeightedSetCover(
  sets: IdentifiedSet<string>[],
  targetElements: string[]
): CoverProposal[] {
  if (targetElements.length === 0) return [];

  const targetSet = new Set(targetElements);
  const n = sets.length;

  // scopy[i] = the target elements still uncovered in set i
  const scopy: Set<string>[] = sets.map((s) => {
    const filtered = new Set<string>();
    for (const e of s.elements) {
      if (targetSet.has(e)) filtered.add(e);
    }
    return filtered;
  });

  const w = sets.map((s) => s.cost);
  const ids = sets.map((s) => s.id);

  // Build udict: target-element → set of indices containing it
  const udict = new Map<string, Set<number>>();
  for (let i = 0; i < n; i++) {
    for (const elem of scopy[i]) {
      if (!udict.has(elem)) udict.set(elem, new Set());
      udict.get(elem)!.add(i);
    }
  }

  // If any target element is in zero sets, no cover exists
  for (const e of targetElements) {
    if (!udict.has(e)) return [];
  }

  const pq = new PriorityQueue();
  const selected: number[] = [];
  let cost = 0;
  let coveredCount = 0;

  for (let i = 0; i < n; i++) {
    if (scopy[i].size === 0) {
      pq.addtask(i, MAX_PRIORITY);
    } else {
      pq.addtask(i, w[i] / scopy[i].size);
    }
  }

  while (coveredCount < targetElements.length) {
    const a = pq.poptask();
    selected.push(ids[a]);
    cost += w[a];
    coveredCount += scopy[a].size;

    // Update sets that still contain the newly covered elements
    for (const m of scopy[a]) {
      const setsWithM = udict.get(m);
      if (!setsWithM) continue;
      for (const n of setsWithM) {
        if (n !== a) {
          scopy[n].delete(m);
          if (scopy[n].size === 0) {
            pq.addtask(n, MAX_PRIORITY);
          } else {
            pq.addtask(n, w[n] / scopy[n].size);
          }
        }
      }
    }
    scopy[a].clear();
    pq.addtask(a, MAX_PRIORITY);
  }

  return [{ setIds: selected, totalCost: cost }];
}
