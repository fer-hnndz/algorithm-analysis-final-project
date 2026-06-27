import { describe, expect, it } from "vitest";
import { findBalloonSubsets } from "@/lib/subset-sum-solver";
import type { BalloonCluster } from "@/lib/subset-sum-types";

function cluster(id: string, liftKg: number): BalloonCluster {
  return {
    id,
    name: id,
    cantGlobos: 1000,
    liftKg,
    category: "starter",
  };
}

describe("findBalloonSubsets", () => {
  it("returns only combinations that equal the target", () => {
    const results = findBalloonSubsets(
      [cluster("A", 10), cluster("B", 15), cluster("C", 25)],
      25,
    );

    expect(results).toHaveLength(2);
    expect(results.every((result) => result.totalLiftKg === 25)).toBe(true);
  });

  it("orders exact combinations by their number of clusters", () => {
    const results = findBalloonSubsets(
      [cluster("A", 10), cluster("B", 15), cluster("C", 25)],
      25,
    );

    expect(results.map((result) => result.clusterCount)).toEqual([1, 2]);
    expect(results[0].selectedIds).toEqual(["C"]);
  });

  it("returns an empty list when no exact combination exists", () => {
    const results = findBalloonSubsets(
      [cluster("A", 10), cluster("B", 15)],
      24,
    );

    expect(results).toEqual([]);
  });

  it("returns an empty list for an invalid target", () => {
    expect(findBalloonSubsets([cluster("A", 10)], 0)).toEqual([]);
    expect(findBalloonSubsets([cluster("A", 10)], -10)).toEqual([]);
  });

  it("searches exhaustively beyond the previous 16-cluster limit", () => {
    const items = Array.from({ length: 17 }, (_, index) =>
      cluster(`cluster-${index}`, 1),
    );
    const results = findBalloonSubsets(items, 17);

    expect(results).toHaveLength(1);
    expect(results[0].clusterCount).toBe(17);
    expect(results[0].totalLiftKg).toBe(17);
  });
});
