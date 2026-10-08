import { createResidualHeight } from "#src/terrain/createResidualHeight";
import { createSimplexNoise } from "#src/noise/createSimplexNoise";
import { describe, expect, test } from "vitest";

describe(createResidualHeight, () => {
  test("sums each octave at twice the frequency and half the amplitude of the one below", () => {
    expect.hasAssertions();

    const seed = 3;
    const noise = createSimplexNoise(seed);
    const getHeight = createResidualHeight({ amplitude: 2, octaves: 2, scale: 8, seed });

    expect(getHeight(5, 9)).toBeCloseTo(2 * noise(5 / 8, 9 / 8) + noise((5 * 2) / 8, (9 * 2) / 8));
  });
});
