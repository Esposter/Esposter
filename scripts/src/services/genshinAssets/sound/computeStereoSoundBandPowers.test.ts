import { SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { computeStereoSoundBandPowers } from "#src/services/genshinAssets/sound/computeStereoSoundBandPowers";
import { getSoundEffectBandBins, SOUND_EFFECT_FRAME_LENGTH } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(computeStereoSoundBandPowers, () => {
  const frequency = 1000;
  const bin = (frequency * SOUND_EFFECT_FRAME_LENGTH) / SOUND_SAMPLE_RATE;
  const band = getSoundEffectBandBins(SOUND_SAMPLE_RATE).findIndex(
    ([lowBin, highBin]) => lowBin <= bin && bin <= highBin,
  );
  const createTone = (phase: number): Float32Array =>
    Float32Array.from({ length: SOUND_SAMPLE_RATE }, (_value, index) =>
      Math.sin((2 * Math.PI * frequency * index) / SOUND_SAMPLE_RATE + phase),
    );

  test("reads a tone both channels play alike as shared", () => {
    expect.hasAssertions();

    const tone = createTone(0);
    const { left, right, shared } = computeStereoSoundBandPowers(tone, tone);
    const middle = Math.floor(shared.length / 2);

    expect(shared[middle]?.[band]).toBeCloseTo(0.5, 2);
    expect(left[middle]?.[band]).toBeCloseTo(0, 6);
    expect(right[middle]?.[band]).toBeCloseTo(0, 6);
  });

  test("reads a tone a quarter turn apart in each channel as each channel's own", () => {
    expect.hasAssertions();

    const { left, right, shared } = computeStereoSoundBandPowers(createTone(0), createTone(Math.PI / 2));
    const middle = Math.floor(shared.length / 2);

    expect(shared[middle]?.[band]).toBeCloseTo(0, 2);
    expect(left[middle]?.[band]).toBeCloseTo(0.5, 2);
    expect(right[middle]?.[band]).toBeCloseTo(0.5, 2);
  });
});
