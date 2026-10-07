import { SOUND_EFFECT_FRAME_LENGTH } from "#src/audio/constants";
import { getSoundEffectBandBins } from "#src/audio/getSoundEffectBandBins";
import { describe, expect, test } from "vitest";

describe(getSoundEffectBandBins, () => {
  test("spans no bin past the frame's last for a band above the rate's Nyquist", () => {
    expect.hasAssertions();

    const lastBin = SOUND_EFFECT_FRAME_LENGTH / 2 - 1;
    const bandBins = getSoundEffectBandBins(32_000);

    expect(bandBins.every(([lowBin, highBin]) => lowBin > lastBin || (lowBin <= highBin && highBin <= lastBin))).toBe(
      true,
    );
    expect(bandBins.at(-1)?.[0]).toBeGreaterThan(bandBins.at(-1)?.[1] ?? 0);
  });
});
