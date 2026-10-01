import { solveFogColors } from "#src/services/genshinParity/solveFogColors";
import { describe, expect, test } from "vitest";

describe(solveFogColors, () => {
  test("recovers the fog's own and sunward colours from points hazed by them", () => {
    expect.hasAssertions();

    const color = [0.5, 0.4, 0.3] as const;
    const scatterColor = [1, 0.6, 0.2] as const;
    const samples = [
      [0.2, 0],
      [0.6, 0],
      [0.5, 1],
      [0.8, 0.5],
    ].map(([opacity = 0, scatter = 0]) => {
      const clear = [0.1, 0.2, 0.3] as [number, number, number];
      const reference = clear.map(
        (value, channel) =>
          value * (1 - opacity) +
          ((color[channel] ?? 0) * (1 - scatter) + (scatterColor[channel] ?? 0) * scatter) * opacity,
      ) as [number, number, number];
      return { clear, opacity, reference, scatter, weight: 1 };
    });
    const solved = solveFogColors(samples);

    expect(solved.color.map((value) => Number(value.toFixed(6)))).toStrictEqual([...color]);
    expect(solved.scatterColor.map((value) => Number(value.toFixed(6)))).toStrictEqual([...scatterColor]);
    expect(solved.residual).toBeLessThan(1e-9);
  });

  test("leaves the sunward colour the fog's own where no point looks toward the sun", () => {
    expect.hasAssertions();

    const samples = [0.2, 0.6].map((opacity) => ({
      clear: [0, 0, 0] as [number, number, number],
      opacity,
      reference: [opacity, opacity, opacity] as [number, number, number],
      scatter: 0,
      weight: 1,
    }));
    const { color, scatterColor } = solveFogColors(samples);

    expect(scatterColor).toStrictEqual(color);
  });
});
