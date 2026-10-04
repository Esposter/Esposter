import { fitBandGain } from "#src/services/genshinParity/fitBandGain";
import { describe, expect, test } from "vitest";

describe(fitBandGain, () => {
  test("raises ours by the median gap", () => {
    expect.hasAssertions();

    expect(fitBandGain({ floor: -60, game: [0, 4, 10], ours: [0, 0, 0] })).toStrictEqual({ distance: 10 / 3, gain: 4 });
  });

  test("charges nothing for a frame quiet on both sides", () => {
    expect.hasAssertions();

    expect(fitBandGain({ floor: 0, game: [0, 6], ours: [-Infinity, 0] })).toStrictEqual({ distance: 0, gain: 6 });
  });

  test("brings ours down to the floor where the game's band lies on it", () => {
    expect.hasAssertions();

    expect(fitBandGain({ floor: 0, game: [0], ours: [6] })).toStrictEqual({ distance: 0, gain: -6 });
  });
});
