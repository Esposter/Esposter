import { computeNoiseSamples } from "#src/audio/computeNoiseSamples";
import { describe, expect, test } from "vitest";

const getDeviation = (samples: Float32Array): number =>
  Math.sqrt(samples.reduce((sum, sample) => sum + sample ** 2, 0) / samples.length);

describe(computeNoiseSamples, () => {
  const sampleRate = 44_100;

  test("sounds each band at the deviation its level gives, the powers of bands apart adding", () => {
    expect.hasAssertions();

    const band = getDeviation(computeNoiseSamples([0, 0, 3], sampleRate));
    const bands = getDeviation(computeNoiseSamples([4, 0, 3], sampleRate));

    expect(band).toBeCloseTo(3);
    expect(bands).toBeCloseTo(5);
  });

  test("is silent with no band sounding", () => {
    expect.hasAssertions();

    expect(getDeviation(computeNoiseSamples([0], sampleRate))).toBe(0);
  });
});
