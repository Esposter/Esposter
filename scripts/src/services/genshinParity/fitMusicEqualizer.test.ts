import { fitMusicEqualizer } from "#src/services/genshinParity/fitMusicEqualizer";
import { describe, expect, test } from "vitest";

describe(fitMusicEqualizer, () => {
  test("scores each half at the gain the other half was fitted to", () => {
    expect.hasAssertions();

    expect(fitMusicEqualizer([{ floor: -60, game: [0, 0, 6, 6], ours: [0, 0, 0, 0] }])).toStrictEqual({
      distance: 3,
      gains: [0],
      heldOutDistance: 6,
    });
  });
});
