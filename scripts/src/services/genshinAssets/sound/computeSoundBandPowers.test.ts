import { SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { computeSoundBandPowers } from "#src/services/genshinAssets/sound/computeSoundBandPowers";
import { MUSIC_NOISE_BAND_CENTRES } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(computeSoundBandPowers, () => {
  test("reads a tone's variance in its own octave band alone", () => {
    expect.hasAssertions();

    const frequency = 1000;
    const samples = Float32Array.from({ length: SOUND_SAMPLE_RATE }, (_value, index) =>
      Math.sin((2 * Math.PI * frequency * index) / SOUND_SAMPLE_RATE),
    );
    const powers = computeSoundBandPowers(samples);
    const band = MUSIC_NOISE_BAND_CENTRES.indexOf(frequency);
    const middle = powers[Math.floor(powers.length / 2)] ?? [];

    expect(middle[band]).toBeCloseTo(0.5, 3);
    expect(middle.filter((_power, index) => index !== band).every((power) => power < 1e-4)).toBe(true);
  });
});
