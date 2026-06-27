import { describe, expect, it } from "vitest";
import { calcularMetaElevacion } from "@/app/subset-sum/balloon-data";

describe("calcularMetaElevacion", () => {
  it("adds a 5 percent safety margin above the house weight", () => {
    expect(calcularMetaElevacion(258000)).toBe(270900);
  });

  it("never creates a negative target", () => {
    expect(calcularMetaElevacion(-1000)).toBe(0);
  });
});
