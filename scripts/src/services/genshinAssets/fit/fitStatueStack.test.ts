import type { Vector } from "#src/models/shared/Vector";

import { fitStatueStack } from "#src/services/genshinAssets/fit/fitStatueStack";
import { describe, expect, test } from "vitest";

// A square ring of radius 1 about x at height y
const toRing = (x: number, y: number): Vector[] => [
  [x + 1, y, 0],
  [x, y, 1],
  [x - 1, y, 0],
  [x, y, -1],
];

describe(fitStatueStack, () => {
  test("stands an upright stack on its foot with each ring about its own section's centre", () => {
    expect.hasAssertions();

    // The lower ring about x 0 at heights 0 to 1, the upper about x 1 at heights 1 to 2
    const { position, sections } = fitStatueStack(
      [...toRing(0, 0), ...toRing(0, 0.9), ...toRing(1, 1.1), ...toRing(1, 2)],
      { angleCount: 4, axis: [0, 1, 0], sectionHeight: 1 },
    );

    expect(position.map((value) => Number(value.toFixed(6)))).toStrictEqual([0.5, 0, 0]);
    expect(
      sections.map(({ centre, height, radii }) => ({
        centre: centre.map((value) => Number(value.toFixed(6))),
        height,
        radii: radii.map((value) => Number(value.toFixed(6))),
      })),
    ).toStrictEqual([
      { centre: [-0.5, 0], height: 1, radii: [1, 1, 1, 1] },
      { centre: [0.5, 0], height: 1, radii: [1, 1, 1, 1] },
    ]);
  });
});
