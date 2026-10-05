import { SKY_TERMS } from "#src/services/genshinParity/sky/constants";
import { fitSky } from "#src/services/genshinParity/sky/fitSky";
import { describe, expect, test } from "vitest";

describe(fitSky, () => {
  // Every pixel weighed by the first term alone, so the sky is one colour
  const weights = SKY_TERMS.map((_value, term) => (term === 0 ? 1 : 0));

  test("solves a sky of one colour with no residual", () => {
    expect.hasAssertions();

    const color: [number, number, number] = [0.2, 0.1, 0.3];
    const { colors, residual } = fitSky([{ color, weights }]);

    expect(colors[0]?.map((value) => Number(value.toFixed(2)))).toStrictEqual(color);
    expect(Number(residual.toFixed(2))).toBe(0);
  });

  test("leaves a lit haze out of the pixels its residual reads", () => {
    expect.hasAssertions();

    const clear = Array.from({ length: 9 }, () => ({ color: [0.2, 0.1, 0.3] as [number, number, number], weights }));
    const { kept } = fitSky([...clear, { color: [0.9, 0.6, 0.5], weights }]);

    expect(kept).toBe(clear.length);
  });
});
