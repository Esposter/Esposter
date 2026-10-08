import { computeEdgeDistance } from "#src/services/genshinParity/witness/computeEdgeDistance";
import { findShadowEdges } from "#src/services/genshinParity/witness/findShadowEdges";
import { describe, expect, test } from "vitest";

describe(computeEdgeDistance, () => {
  const width = 8;
  const height = 2;
  const isReceiver = new Uint8Array(width * height).fill(1);
  // A shadow over the receivers' left columns up to the one given, its edge that column
  const castShadow = (edgeColumn: number): Uint8Array =>
    findShadowEdges(
      Uint8Array.from({ length: width * height }, (_value, pixel) => Number(pixel % width <= edgeColumn)),
      isReceiver,
      width,
      height,
    );

  test("prices two shadows' edges by the columns between them, both ways", () => {
    expect.hasAssertions();

    expect(computeEdgeDistance(castShadow(1), castShadow(4), width, height)).toBe(3);
  });

  test("prices a shadow with no edge on the receivers as far as can be", () => {
    expect.hasAssertions();

    expect(computeEdgeDistance(castShadow(width - 1), castShadow(1), width, height)).toBe(Infinity);
  });
});
