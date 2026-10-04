import { fitSky, SKY_TERMS } from "#src/services/genshinParity/fitSky";
import { describe, expect, test } from "vitest";

describe(fitSky, () => {
  // Every pixel weighed by the first term alone, so the sky is one colour
  const weights = SKY_TERMS.map((_, term) => (term === 0 ? 1 : 0));

  test("solves a sky of one colour with no residual", () => {
    expect.hasAssertions();

    const color: [number, number, number] = [0.2, 0.1, 0.3];
    const { colors, residual } = fitSky([{ color, weights }]);

    expect(colors[0]?.map((value) => Number(value.toFixed(2)))).toStrictEqual(color);
    expect(Number(residual.toFixed(2))).toBe(0);
  });
});
