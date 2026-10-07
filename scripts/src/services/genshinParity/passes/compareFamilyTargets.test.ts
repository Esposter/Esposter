import { compareFamilyTargets } from "#src/services/genshinParity/passes/compareFamilyTargets";
import { describe, expect, test } from "vitest";

const createTargets = (
  families: (number | undefined)[],
  depths: number[],
  normals: [number, number, number][],
): { depth: Float32Array; normal: Float32Array; part: Float32Array } => ({
  depth: Float32Array.from(depths.flatMap((depth) => [depth, 0, 0, 1])),
  normal: Float32Array.from(normals.flatMap((normal) => [...normal, 1])),
  part: Float32Array.from(families.flatMap((family) => (family === undefined ? [0, 0, 0, 1] : [1, family, 0, 1]))),
});

describe(compareFamilyTargets, () => {
  test("reads the outlines apart over the exports' outline, and depth and normals where both draw", () => {
    expect.hasAssertions();

    const up: [number, number, number] = [0, 1, 0];
    const toward: [number, number, number] = [0, 0, 1];
    const exportsTargets = createTargets([undefined, 0, 0, undefined], [0, 1, 1, 0], [up, up, up, up]);
    const oursTargets = createTargets([undefined, undefined, 0, 0], [0, 0, 2, 2], [up, up, toward, toward]);

    expect(compareFamilyTargets(exportsTargets, oursTargets, 4, 2)).toStrictEqual([
      { depth: 1, family: 0, normal: 90, outline: 1, partNormals: [{ angle: 90, part: 1, pixelCount: 1 }] },
    ]);
  });
});
