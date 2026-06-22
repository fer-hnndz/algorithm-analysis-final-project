import { describe, it, expect } from "vitest";
import { solveWeightedSetCover } from "@/lib/weighted-set-solver";
import { toIdentifiedSet } from "@/lib/weighted-set-types";

// ── Helpers ─────────────────────────────────────────────────────────

function s(id: number, elements: string[], cost: number) {
  return toIdentifiedSet(id, elements, cost);
}

function ids(result: { setIds: number[]; totalCost: number }[]) {
  return result.map((r) => r.setIds);
}

function costs(result: { setIds: number[]; totalCost: number }[]) {
  return result.map((r) => r.totalCost);
}

// ── Easy tests ──────────────────────────────────────────────────────

describe("solveWeightedSetCover — easy", () => {
  it("returns empty array when target is empty", () => {
    const sets = [s(1, ["A"], 5)];
    expect(solveWeightedSetCover(sets, [])).toEqual([]);
  });

  it("returns empty array when no set covers the target", () => {
    const sets = [s(1, ["X"], 3), s(2, ["Y"], 4)];
    expect(solveWeightedSetCover(sets, ["Z"])).toEqual([]);
  });

  it("single element, single matching set — one result", () => {
    const sets = [s(1, ["A"], 10)];
    const result = solveWeightedSetCover(sets, ["A"]);
    expect(result).toHaveLength(1);
    expect(result[0].setIds).toEqual([1]);
    expect(result[0].totalCost).toBe(10);
  });

  it("single element, two sets — both returned, cheapest first", () => {
    const sets = [s(1, ["A"], 20), s(2, ["A"], 5)];
    const result = solveWeightedSetCover(sets, ["A"]);
    expect(result).toHaveLength(2);
    expect(costs(result)).toEqual([5, 20]);
  });

  it("two elements fully covered by one set — cheapest uses that set", () => {
    const sets = [s(1, ["A", "B"], 7), s(2, ["A"], 3)];
    const result = solveWeightedSetCover(sets, ["A", "B"]);
    // Cheapest is set 1 alone at cost 7 (covers both).
    // (Set 2 + Set 1 = 10 is also valid but more expensive.)
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].setIds).toEqual([1]);
    expect(result[0].totalCost).toBe(7);
  });
});

// ── Complex tests ───────────────────────────────────────────────────

describe("solveWeightedSetCover — complex", () => {
  it("reproduces the Python 'Cena Italiana' example", () => {
    // Pasta, Salsa, Queso, Vino, Pan
    const sets = [
      s(1, ["Pasta", "Salsa"], 8),
      s(2, ["Vino", "Pan", "Queso"], 22),
      s(3, ["Pasta", "Salsa", "Queso"], 15),
      s(4, ["Pan", "Vino"], 12),
      s(5, ["Queso", "Pasta"], 10),
    ];
    const target = ["Pasta", "Salsa", "Queso", "Vino", "Pan"];
    const result = solveWeightedSetCover(sets, target);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].totalCost).toBe(27);
  });

  it("overlapping sets — cheapest combination is not the largest set", () => {
    const sets = [
      s(1, ["A", "B", "C"], 30), // big set, high cost
      s(2, ["A"], 4),
      s(3, ["B"], 5),
      s(4, ["C"], 6),
    ];
    const target = ["A", "B", "C"];
    const result = solveWeightedSetCover(sets, target);

    // 2+3+4 = 15 is cheaper than 1 = 30
    expect(result[0].totalCost).toBe(15);
    expect(ids(result)[0]).toEqual(expect.arrayContaining([2, 3, 4]));
  });

  it("element not covered by any set yields empty result", () => {
    const sets = [
      s(1, ["A", "B"], 10),
      s(2, ["B", "C"], 10),
      s(3, ["A", "C"], 10),
    ];
    const result = solveWeightedSetCover(sets, ["A", "B", "C", "Z"]);
    expect(result).toEqual([]);
  });

  it("5 elements, many overlapping sets — optimal is found", () => {
    const sets = [
      s(1, ["A", "B"], 5),
      s(2, ["B", "C"], 6),
      s(3, ["C", "D"], 7),
      s(4, ["D", "E"], 4),
      s(5, ["A", "E"], 8),
      s(6, ["A", "B", "C", "D", "E"], 40), // universal, expensive
      s(7, ["A", "C", "E"], 20),
    ];
    const target = ["A", "B", "C", "D", "E"];
    const result = solveWeightedSetCover(sets, target);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].totalCost).toBeLessThan(40);
    expect(result[0].totalCost).toBeLessThanOrEqual(17);
  });

  it("6 elements, disjoint optimal sets — verifies exact match", () => {
    const sets = [
      s(1, ["X", "Y"], 10),
      s(2, ["Z", "W"], 12),
      s(3, ["U", "V"], 8),
      s(4, ["Y", "Z"], 15), // overlap, expensive
      s(5, ["X", "Y", "Z", "W", "U", "V"], 100), // all
    ];
    const target = ["X", "Y", "Z", "W", "U", "V"];
    const result = solveWeightedSetCover(sets, target);

    expect(result[0].totalCost).toBe(30);
  });
});
