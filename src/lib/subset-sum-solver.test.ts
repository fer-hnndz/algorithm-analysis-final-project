import { describe, expect, it } from "vitest";
import {
  compareWithExact,
  rankBalloonSubsets,
  solveBalloonSubsetSum,
  solveBalloonSubsetSumExact,
} from "@/lib/subset-sum-solver";
import type { BalloonCluster } from "@/lib/subset-sum-types";

function cluster(id: string, liftKg: number): BalloonCluster {
  return {
    id,
    name: id,
    balloonCount: 1000,
    liftKg,
    category: "starter",
  };
}

describe("solveBalloonSubsetSum", () => {
  it("never exceeds the target weight", () => {
    const result = solveBalloonSubsetSum(
      [cluster("A", 12), cluster("B", 25), cluster("C", 30)],
      40,
    );

    expect(result.plan.totalLiftKg).toBeLessThanOrEqual(40);
    expect(result.plan.remainingTargetKg).toBe(40 - result.plan.totalLiftKg);
  });

  it("uses cluster count as a tie breaker", () => {
    const exact = solveBalloonSubsetSumExact(
      [cluster("A", 10), cluster("B", 10), cluster("C", 20)],
      20,
    );

    expect(exact.totalLiftKg).toBe(20);
    expect(exact.clusterCount).toBe(2);
    expect(exact.selectedIds).toEqual(["A", "B"]);
  });

  it("local repair improves a greedy dead end", () => {
    const result = solveBalloonSubsetSum(
      [
        cluster("small-1", 8),
        cluster("small-2", 9),
        cluster("small-3", 10),
        cluster("upgrade", 23),
      ],
      25,
    );

    expect(result.plan.totalLiftKg).toBe(23);
    expect(result.steps.some((step) => step.phase === "repair")).toBe(true);
  });

  it("keeps at least the documented 1/2 approximation on small instances", () => {
    const items = [
      cluster("A", 6),
      cluster("B", 9),
      cluster("C", 13),
      cluster("D", 21),
      cluster("E", 25),
    ];
    const budget = 31;
    const heuristic = solveBalloonSubsetSum(items, budget).plan;
    const exact = solveBalloonSubsetSumExact(items, budget);

    expect(heuristic.totalLiftKg).toBeGreaterThanOrEqual(exact.totalLiftKg * 0.5);
  });

  it("reports comparison metrics against exhaustive search", () => {
    const comparison = compareWithExact(
      [cluster("A", 7), cluster("B", 14), cluster("C", 18)],
      21,
    );

    expect(comparison.optimal.totalLiftKg).toBe(21);
    expect(comparison.gap).toBeGreaterThanOrEqual(0);
    expect(comparison.optimalUsePercent).toBe(100);
  });

  it("updates the ranked combinations when the target changes", () => {
    const items = [cluster("A", 10), cluster("B", 15), cluster("C", 24)];
    const lowTarget = rankBalloonSubsets(items, 14);
    const highTarget = rankBalloonSubsets(items, 23);

    expect(lowTarget[0].selectedIds).toEqual(["B"]);
    expect(highTarget[0].selectedIds).toEqual(["C"]);
  });
});
