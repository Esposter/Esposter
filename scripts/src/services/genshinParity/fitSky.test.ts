import { fitSky, SKY_TERMS } from "#src/services/genshinParity/fitSky";
import { describe, expect, test } from "vitest";

describe(fitSky, () => {
  // Every pixel weighed by the first term alone, so the sky is one colour
  const weights = SKY_TERMS.map((_, term) => (term === 0 ? 1 : 0));

  test("solves the clear sky under brighter clouds covering half of it", () => {
    expect.hasAssertions();

    const sky = [0.2, 0.1, 0.3] as const;
    const samples = Array.from({ length: 200 }, (_, index) => {
      const isCloud = index % 2 === 0;
      const noise = ((index % 7) - 3) * 0.002;
      return {
        color: (isCloud ? [0.9, 0.6, 0.5] : sky.map((value) => value + noise)) as [number, number, number],
        weights,
      };
    });
    const { colors } = fitSky(samples);

    expect(colors[0]?.map((value) => Number(value.toFixed(2)))).toStrictEqual([...sky]);
  });
});
