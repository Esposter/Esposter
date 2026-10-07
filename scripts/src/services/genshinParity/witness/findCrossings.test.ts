import { findCrossings } from "#src/services/genshinParity/witness/findCrossings";
import { describe, expect, test } from "vitest";

describe(findCrossings, () => {
  test("times each edge between its two frames by the frames' own times, darkening and brightening apart", () => {
    expect.hasAssertions();

    // A landmark darkening the column for four frames, the frame after it a second later than the rest
    const values = [4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 4];
    const times = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11];

    expect(findCrossings(values, times)).toStrictEqual([
      { isFalling: true, time: 2.5, uncertainty: 1 / Math.sqrt(12) },
      { isFalling: false, time: 7, uncertainty: 2 / Math.sqrt(12) },
    ]);
  });

  test("times an edge whose frame lands on the threshold at that frame", () => {
    expect.hasAssertions();

    const values = [4, 4, 2, 0, 0, 4, 4];
    const times = [0, 1, 2, 3, 4, 5, 6];

    expect(findCrossings(values, times)).toStrictEqual([
      { isFalling: true, time: 2, uncertainty: 1 / Math.sqrt(12) },
      { isFalling: false, time: 4.5, uncertainty: 1 / Math.sqrt(12) },
    ]);
  });
});
