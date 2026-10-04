import { refineVoicePowers } from "#src/services/genshinAssets/refineVoicePowers";
import { describe, expect, test } from "vitest";

describe(refineVoicePowers, () => {
  test("steps a voice's power until its mix meets the game's energy", () => {
    expect.hasAssertions();

    expect(refineVoicePowers([Float64Array.of(1)], [1], Float64Array.of(4), [0.1], 1)).toStrictEqual([4]);
  });
});
