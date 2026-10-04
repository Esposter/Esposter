import { fitBroadbandGain } from "#src/services/genshinParity/fitBroadbandGain";
import { describe, expect, test } from "vitest";

describe(fitBroadbandGain, () => {
  test("fits one gain across bands of different floors", () => {
    expect.hasAssertions();

    expect(
      fitBroadbandGain([
        { floor: -60, game: [6], ours: [0] },
        { floor: -20, game: [-14], ours: [-20] },
      ]),
    ).toStrictEqual({ distance: 0, gain: 6 });
  });
});
