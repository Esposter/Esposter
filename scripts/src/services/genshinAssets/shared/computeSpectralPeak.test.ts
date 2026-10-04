import { computeSpectralPeak } from "#src/services/genshinAssets/shared/computeSpectralPeak";
import { describe, expect, test } from "vitest";

describe(computeSpectralPeak, () => {
  test("holds a bin on a slope to within half a bin of it", () => {
    expect.hasAssertions();

    // Rising almost in a line to the fourth bin, so the three around the second curve only barely
    const magnitudes = new Float32Array([0, 1, 2, 2.99, 4]);
    const { frequency, magnitude } = computeSpectralPeak(
      { binCount: magnitudes.length, frameCount: 1, frameLength: 2, hopLength: 1, magnitudes, sampleRate: 2 },
      0,
      2,
    );

    expect(frequency).toBeGreaterThanOrEqual(1.5);
    expect(frequency).toBeLessThanOrEqual(3.5);
    expect(magnitude).toBeLessThan(magnitudes[4] ?? 0);
  });
});
