import { fitLight } from "#src/services/genshinParity/fitLight";
import { describe, expect, test } from "vitest";

describe(fitLight, () => {
  test("recovers the sun's and the ambient's colours that lit pixels from a direction", () => {
    expect.hasAssertions();

    const direction: [number, number, number] = [0, 1, 0];
    const normals: [number, number, number][] = [
      [0, 1, 0],
      [Math.SQRT1_2, Math.SQRT1_2, 0],
      [1, 0, 0],
    ];
    const samples = normals.map((normal) => {
      const lit = Math.max(0, normal[1]);
      const albedo: [number, number, number] = [0.5, 0.5, 0.5];
      return {
        albedo,
        color: albedo.map((value, channel) => value * ([1, 0.8, 0.6][channel] ?? 0) * lit + value * 0.2) as [
          number,
          number,
          number,
        ],
        normal,
      };
    });

    const { ambient, residual, sun } = fitLight(samples, direction);

    expect(residual).toBeLessThan(1e-9);
    for (const [index, value] of [1, 0.8, 0.6].entries()) expect(sun[index]).toBeCloseTo(value);
    for (const value of ambient) expect(value).toBeCloseTo(0.2);
  });
});
