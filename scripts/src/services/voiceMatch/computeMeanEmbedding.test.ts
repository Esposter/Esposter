import { computeMeanEmbedding } from "#src/services/voiceMatch/computeMeanEmbedding";
import { describe, expect, test } from "vitest";

describe(computeMeanEmbedding, () => {
  test("renormalises the mean of unit vectors", () => {
    expect.hasAssertions();

    const [x, y] = computeMeanEmbedding([Float32Array.of(1, 0), Float32Array.of(0, 1)]);

    expect(x).toBeCloseTo(Math.SQRT1_2);
    expect(y).toBeCloseTo(Math.SQRT1_2);
  });
});
