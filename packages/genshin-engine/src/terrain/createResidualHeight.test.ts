import { createSimplexNoise } from "#src/noise/createSimplexNoise";
import { createResidualHeight } from "#src/terrain/createResidualHeight";
import { describe, expect, test } from "vitest";

describe(createResidualHeight, () => {
  const residual = { amplitude: 2, octaves: 2, scale: 8, seed: 3 };
  const getHeight = createResidualHeight(residual);
  const getFadedHeight = createResidualHeight({
    ...residual,
    fade: { cellSize: 8, clearings: [], origin: [1, 1], size: [2, 2], weights: [0, 1, 0, 1] },
  });
  const getClearedHeight = createResidualHeight({
    ...residual,
    fade: {
      cellSize: 16,
      clearings: [{ falloff: 4, radius: 2, x: 4, z: 4 }],
      origin: [0, 0],
      size: [2, 2],
      weights: [1, 1, 1, 1],
    },
  });

  test("sums each octave at twice the frequency and half the amplitude of the one below", () => {
    expect.hasAssertions();

    const noise = createSimplexNoise(residual.seed);

    expect(getHeight(5, 9)).toBeCloseTo(2 * noise(5 / 8, 9 / 8) + noise((5 * 2) / 8, (9 * 2) / 8));
  });

  test.each([
    ["at a node its fade weighs none", getFadedHeight, 1, 1],
    ["outside its fade's grid", getFadedHeight, -3, 1],
    ["inside its fade's clearing", getClearedHeight, 4, 4],
  ])("draws none of the residual %s", (_title, getResidualHeight, x, z) => {
    expect.hasAssertions();

    expect(getHeight(x, z)).not.toBe(0);
    expect(getResidualHeight(x, z)).toBe(0);
  });

  test.each([
    ["all of the residual at a node weighing one", getFadedHeight, 9, 1, 1],
    ["the mean of the four nodes round a point between them", getFadedHeight, 5, 5, 0.5],
    ["half of the residual halfway across its clearing's falloff", getClearedHeight, 8, 4, 0.5],
    ["all of the residual past its clearing's falloff", getClearedHeight, 16, 16, 1],
  ])("draws %s", (_title, getResidualHeight, x, z, weight) => {
    expect.hasAssertions();

    expect(getResidualHeight(x, z)).toBe(weight * getHeight(x, z));
  });
});
