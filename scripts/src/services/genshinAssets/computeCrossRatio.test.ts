import { computeCrossRatio } from "#src/services/genshinAssets/computeCrossRatio";
import { describe, expect, test } from "vitest";

// A projection of a line onto another
const project = (x: number): number => (2 * x + 1) / (x + 3);

describe(computeCrossRatio, () => {
  test("keeps its value through a projection of the line", () => {
    expect.hasAssertions();

    const points: [number, number, number, number] = [0, 1, 2, 3];

    expect(computeCrossRatio(points)).toBeCloseTo(4 / 3);
    expect(computeCrossRatio([project(0), project(1), project(2), project(3)])).toBeCloseTo(4 / 3);
  });
});
