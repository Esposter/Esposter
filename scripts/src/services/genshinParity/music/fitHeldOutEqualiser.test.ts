import { fitHeldOutEqualiser } from "#src/services/genshinParity/music/fitHeldOutEqualiser";
import { describe, expect, test } from "vitest";

describe(fitHeldOutEqualiser, () => {
  const floor = -60;

  test("holds a gain the whole render needs on the half it was not fitted on", () => {
    expect.hasAssertions();

    expect(fitHeldOutEqualiser([{ floor, game: [6, 6, 6, 6], ours: [0, 0, 0, 0] }])).toStrictEqual({
      distance: 6,
      equalisedDistance: 0,
      gains: [6],
      heldOutDistance: 0,
    });
  });

  test("charges a gain that fits one half alone on the other", () => {
    expect.hasAssertions();

    expect(fitHeldOutEqualiser([{ floor, game: [6, 6, 0, 0], ours: [0, 0, 0, 0] }])).toStrictEqual({
      distance: 3,
      equalisedDistance: 3,
      gains: [0],
      heldOutDistance: 6,
    });
  });
});
