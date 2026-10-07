import { computeSoundEffectSamples } from "#src/audio/computeSoundEffectSamples";
import { SOUND_EFFECT_BAND_EDGES } from "#src/audio/constants";
import { describe, expect, test } from "vitest";

const getDeviation = (samples: Float32Array): number =>
  Math.sqrt(samples.reduce((sum, sample) => sum + sample ** 2, 0) / samples.length);
const getCorrelation = (first: Float32Array, second: Float32Array): number => {
  let product = 0;
  for (const [index, sample] of first.entries()) product += sample * (second[index] ?? 0);
  return product / first.length / (getDeviation(first) * getDeviation(second));
};

// One band a few octaves up, lit in every frame, the others silent
const createLevels = (level: number): number[][] =>
  Array.from({ length: 4 }, () => SOUND_EFFECT_BAND_EDGES.slice(1).map((_edge, band) => (band === 12 ? level : 0)));

describe(computeSoundEffectSamples, () => {
  const sampleRate = 48_000;
  const frameSeconds = 0.5;
  const frameLength = frameSeconds * sampleRate;

  test("sounds each channel at the power its own noise and the shared one add to", () => {
    expect.hasAssertions();

    const [left, right] = computeSoundEffectSamples(
      { frameSeconds, leftLevels: createLevels(4), rightLevels: createLevels(0), sharedLevels: createLevels(3) },
      sampleRate,
    );
    const middle = (samples: Float32Array) => samples.subarray(frameLength, 3 * frameLength);

    expect(left).toHaveLength(4 * frameLength);
    expect(getDeviation(middle(left))).toBeCloseTo(5, 0);
    expect(getDeviation(middle(right))).toBeCloseTo(3, 0);
    expect(getCorrelation(middle(left), middle(right))).toBeCloseTo(3 / 5, 1);
  });
});
