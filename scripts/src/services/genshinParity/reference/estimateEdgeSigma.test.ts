import { estimateEdgeSigma } from "#src/services/genshinParity/reference/estimateEdgeSigma";
import { describe, expect, test } from "vitest";

describe(estimateEdgeSigma, () => {
  const EDGE_POSITION = 30;
  const PROFILE_LENGTH = 61;
  const LOW = 20;
  const HIGH = 220;
  const RELATIVE_TOLERANCE = 0.1;
  // A step blurred by a discrete Gaussian of the sigma given, sampled at each pixel of the profile
  const getBlurredStep = (sigma: number): number[] => {
    const radius = Math.ceil(4 * sigma);
    const weights = Array.from({ length: radius * 2 + 1 }, (_value, index) =>
      Math.exp(-((index - radius) ** 2) / (2 * sigma ** 2)),
    );
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    return Array.from({ length: PROFILE_LENGTH }, (_value, position) =>
      weights.reduce((sum, weight, index) => {
        const sample = Math.min(Math.max(position + index - radius, 0), PROFILE_LENGTH - 1);
        return sum + (weight / weightSum) * (sample >= EDGE_POSITION ? HIGH : LOW);
      }, 0),
    );
  };

  test.each([1.5, 2, 3])("recovers a step blurred by sigma %s within a tenth", (sigma) => {
    expect.hasAssertions();

    const estimate = estimateEdgeSigma(getBlurredStep(sigma));

    expect(estimate).toBeDefined();
    expect(Math.abs((estimate ?? 0) - sigma) / sigma).toBeLessThan(RELATIVE_TOLERANCE);
  });

  test("reads a falling edge as the same sigma as a rising one", () => {
    expect.hasAssertions();

    const rising = estimateEdgeSigma(getBlurredStep(2));
    const falling = estimateEdgeSigma(getBlurredStep(2).toReversed());

    expect(falling).toBeCloseTo(rising ?? 0, 10);
  });

  test("has no edge in a flat profile", () => {
    expect.hasAssertions();

    expect(estimateEdgeSigma(Array.from({ length: PROFILE_LENGTH }, () => LOW))).toBeUndefined();
  });
});
