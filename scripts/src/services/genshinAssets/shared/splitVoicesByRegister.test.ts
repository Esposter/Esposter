import { splitVoicesByRegister } from "#src/services/genshinAssets/shared/splitVoicesByRegister";
import { describe, expect, test } from "vitest";

describe(splitVoicesByRegister, () => {
  test("splits at the gaps between a bass, a middle line and a melody", () => {
    expect.hasAssertions();

    // The middle line's top note held twice as often as its bottom, so a split by note counts alone would cut it
    const pitches = [33, 35, 36, 55, 57, 59, 59, 79, 81, 84];

    expect(splitVoicesByRegister(pitches, 3)).toStrictEqual([55, 79]);
  });
});
