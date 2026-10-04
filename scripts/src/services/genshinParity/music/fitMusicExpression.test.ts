import { fitMusicExpression } from "#src/services/genshinParity/music/fitMusicExpression";
import { describe, expect, test } from "vitest";

describe(fitMusicExpression, () => {
  test("follows a swell every band holds, and gives an empty window the nearest earlier gain", () => {
    expect.hasAssertions();

    expect(
      fitMusicExpression(
        [
          { floor: -60, game: [0, 6], ours: [0, 0] },
          { floor: -60, game: [0, 6], ours: [0, 0] },
        ],
        [0, 2],
        1,
      ),
    ).toStrictEqual({ distance: 0, heldOutDistance: 0, windowGains: [0, 0, 6] });
  });

  test("holds out a gain that bends one band's balance", () => {
    expect.hasAssertions();

    expect(
      fitMusicExpression(
        [
          { floor: -60, game: [6], ours: [0] },
          { floor: -60, game: [0], ours: [0] },
        ],
        [0],
        1,
      ).heldOutDistance,
    ).toBe(6);
  });
});
