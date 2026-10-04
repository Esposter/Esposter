import { computeGapsByOnsetAge } from "#src/services/genshinParity/music/computeGapsByOnsetAge";
import { describe, expect, test } from "vitest";

describe(computeGapsByOnsetAge, () => {
  test("reads each frame's gap in the span its time since the last onset lies in", () => {
    expect.hasAssertions();

    expect(
      computeGapsByOnsetAge([{ floor: -60, game: [1, 2, 3], ours: [0, 0, 0] }], [0.05, 0.2, 2], [0]),
    ).toStrictEqual([
      { bandGaps: [-1], share: 1 / 3 },
      { bandGaps: [-2], share: 1 / 3 },
      { bandGaps: [0], share: 0 },
      { bandGaps: [0], share: 0 },
      { bandGaps: [-3], share: 1 / 3 },
    ]);
  });
});
