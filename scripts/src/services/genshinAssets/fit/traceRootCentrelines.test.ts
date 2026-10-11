import { traceRootCentrelines } from "#src/services/genshinAssets/fit/traceRootCentrelines";
import { describe, expect, test } from "vitest";

describe(traceRootCentrelines, () => {
  test("traces a tapering tube from its open end's centre to its tip, simplified to the line it runs along", () => {
    expect.hasAssertions();

    // A cone four metres tall on a square ring of a metre's radius, open at its foot and closed on its tip
    expect(
      traceRootCentrelines(
        [
          [1, 0, 0],
          [0, 0, 1],
          [-1, 0, 0],
          [0, 0, -1],
          [0, 4, 0],
        ],
        [
          [0, 1, 4],
          [1, 2, 4],
          [2, 3, 4],
          [3, 0, 4],
        ],
        { levelStep: 0.5, tolerance: 0.01 },
      ),
    ).toStrictEqual([
      [
        { radius: 1, x: 0, y: 0, z: 0 },
        { radius: 0, x: 0, y: 4, z: 0 },
      ],
    ]);
  });
});
