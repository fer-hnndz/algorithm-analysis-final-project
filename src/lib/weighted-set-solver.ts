import type {
  IdentifiedSet,
  CoverProposal,
} from "@/lib/weighted-set-types";

// ── Internal proposal used during the search ────────────────────────

/**
 * Represents an intermediate state during the breadth-first expansion.
 *
 * A proposal is a partial set cover: it holds a collection of weighted
 * sets that together cover a prefix of the target elements processed so
 * far.  Its total cost is the sum of the costs of its constituent sets.
 */
class Proposal {
  readonly sets: readonly IdentifiedSet[];
  readonly totalCost: number;

  private constructor(sets: IdentifiedSet[]) {
    this.sets = sets;
    this.totalCost = sets.reduce((sum, s) => sum + s.cost, 0);
  }

  /** Creates a new proposal containing a single set. */
  static fromSet(set: IdentifiedSet): Proposal {
    return new Proposal([set]);
  }

  /**
   * Returns a new Proposal with the given set appended.
   *
   * Does nothing if the same set (by id) is already present —
   * adding a duplicate would inflate the cost without adding new coverage.
   */
  withSet(set: IdentifiedSet): Proposal {
    if (this.sets.some((s) => s.id === set.id)) {
      return this;
    }
    return new Proposal([...this.sets, set]);
  }

  /** Checks whether any set in this proposal already covers the element. */
  coversElement(element: string): boolean {
    return this.sets.some((s) => s.hasElement(element));
  }
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Finds all valid weighted set covers for the given universe.
 *
 * **Algorithm overview (breadth-first expansion)**
 *
 * 1.  Start with an empty list of proposals.
 * 2.  Process each target element in order:
 *     a.  **First element** — for every set that contains it, spawn an
 *         initial proposal holding just that set.
 *     b.  **Subsequent elements** — for each existing proposal:
 *         - If the proposal already covers this element (through one of
 *           its sets), carry it forward unchanged.
 *         - Otherwise, clone the proposal for every set that *does*
 *           contain the element and extend each clone with that set.
 * 3.  After the final element, every surviving proposal is a complete
 *     cover.  Return them sorted by total cost (ascending).
 *
 * **Time complexity:** O(|U| * P * |S|) where U = target elements,
 * P = number of partial proposals at each step, S = available sets.
 * In the worst case this is exponential in |U|, but for small inputs
 * (≤ 10 elements and ≤ 15 sets) it finishes quickly and is suitable
 * for an interactive demo.
 *
 * @param sets  Available weighted sets (bags) to choose from.
 * @param targetElements  Universe of elements that must be covered.
 * @returns All valid set covers, cheapest first.
 */
export function solveWeightedSetCover(
  sets: IdentifiedSet[],
  targetElements: string[]
): CoverProposal[] {
  if (targetElements.length === 0) return [];

  const queue = [...targetElements];
  let proposals: Proposal[] = [];

  for (const element of queue) {
    // ── First element: seed the search ──────────────────────────────
    if (proposals.length === 0) {
      for (const set of sets) {
        if (set.hasElement(element)) {
          proposals.push(Proposal.fromSet(set));
        }
      }
    }
    // ── Subsequent elements: expand or retain each partial proposal ──
    else {
      const next: Proposal[] = [];
      for (const prop of proposals) {
        if (prop.coversElement(element)) {
          // Already covered — carry forward as-is.
          next.push(prop);
        } else {
          // Not covered — try every set that supplies this element.
          for (const set of sets) {
            if (set.hasElement(element)) {
              next.push(prop.withSet(set));
            }
          }
        }
      }
      proposals = next;
    }
  }

  // ── Map internal proposals to public result shape, cheapest first ─
  return proposals
    .map((p) => ({
      setIds: p.sets.map((s) => s.id),
      totalCost: p.totalCost,
    }))
    .sort((a, b) => a.totalCost - b.totalCost);
}
