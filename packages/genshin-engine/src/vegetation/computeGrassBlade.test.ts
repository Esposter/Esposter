import { computeGrassBlade } from "#src/vegetation/computeGrassBlade";
import { describe, expect, test } from "vitest";

describe(computeGrassBlade, () => {
  test("narrows up its segments to a point", () => {
    expect.hasAssertions();

    expect(computeGrassBlade(2)).toStrictEqual({
      indices: Uint16Array.from([0, 1, 2, 2, 1, 3, 2, 3, 4]),
      positions: Float32Array.from([-0.5, 0, 0, 0.5, 0, 0, -0.25, 0.5, 0, 0.25, 0.5, 0, 0, 1, 0]),
    });
  });
});
