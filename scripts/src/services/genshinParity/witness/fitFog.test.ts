import { fitFog } from "#src/services/genshinParity/witness/fitFog";
import { describe, expect, test } from "vitest";

describe(fitFog, () => {
  test("recovers the fog's colour and density that hazed lit pixels by their depths", () => {
    expect.hasAssertions();

    const fog = [0.6, 0.7, 0.9];
    const samples = [1, 10, 50, 100, 300].map((depth) => {
      const share = 1 - Math.exp(-0.01 * depth);
      const lit: [number, number, number] = [0.2, 0.3, 0.1];
      return {
        color: lit.map((value, channel) => (1 - share) * value + share * (fog[channel] ?? 0)) as [
          number,
          number,
          number,
        ],
        depth,
        lit,
      };
    });

    const { color, density, residual } = fitFog(samples);

    expect(residual).toBeLessThan(1e-6);
    expect(density).toBeCloseTo(0.01, 4);
    for (const [index, value] of fog.entries()) expect(color[index]).toBeCloseTo(value, 4);
  });
});
