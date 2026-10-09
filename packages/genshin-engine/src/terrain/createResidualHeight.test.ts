import { createSimplexNoise } from "#src/noise/createSimplexNoise";
import { createResidualHeight } from "#src/terrain/createResidualHeight";
import { describe, expect, test } from "vitest";

describe(createResidualHeight, () => {
  const residual = { amplitude: 2, octaves: 2, scale: 8, seed: 3 };
  const getHeight = createResidualHeight(residual);
  const getFadedHeight = createResidualHeight({
    ...residual,
    fade: { cellSize: 8, origin: [1, 1], size: [2, 2], weights: [0, 1, 0, 1] },
  });

  test("sums each octave at twice the frequency and half the amplitude of the one below", () => {
    expect.hasAssertions();

    const noise = createSimplexNoise(residual.seed);

    expect(getHeight(5, 9)).toBeCloseTo(2 * noise(5 / 8, 9 / 8) + noise((5 * 2) / 8, (9 * 2) / 8));
  });

  test("draws none of the residual where its fade weighs none", () => {
    expect.hasAssertions();

    expect(getHeight(1, 1)).not.toBe(0);
    expect(getFadedHeight(1, 1)).toBe(0);
  });

  test.each([
    ["all of the residual at a node weighing one", 9, 1, 1],
    ["the mean of the four nodes round a point between them", 5, 5, 0.5],
    ["all of the residual outside the fade's grid", -3, 1, 1],
  ])("draws %s", (_title, x, z, weight) => {
    expect.hasAssertions();

    expect(getFadedHeight(x, z)).toBe(weight * getHeight(x, z));
  });
});
