import { computeSoundEffectSamples } from "#src/audio/computeSoundEffectSamples";
import { describe, expect, test } from "vitest";

const getDeviation = (samples: Float32Array): number =>
  Math.sqrt(samples.reduce((sum, sample) => sum + sample ** 2, 0) / samples.length);

describe(computeSoundEffectSamples, () => {
  const sampleRate = 44_100;

  test("sounds each frame at its bands' levels, the powers of bands apart adding", () => {
    expect.hasAssertions();

    const frameSeconds = 0.5;
    const samples = computeSoundEffectSamples(
      {
        frameSeconds,
        levels: [
          [0, 0, 3],
          [0, 0, 3],
          [4, 0, 3],
          [4, 0, 3],
        ],
      },
      sampleRate,
    );
    const frameLength = frameSeconds * sampleRate;

    expect(samples).toHaveLength(4 * frameLength);
    expect(getDeviation(samples.subarray(0, frameLength))).toBeCloseTo(3, 0);
    expect(getDeviation(samples.subarray(3 * frameLength))).toBeCloseTo(5, 0);
  });
});
