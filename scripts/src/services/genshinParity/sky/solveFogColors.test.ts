import { solveFogColors } from "#src/services/genshinParity/sky/solveFogColors";
import { describe, expect, test } from "vitest";

describe(solveFogColors, () => {
  type Vector = [number, number, number];
  const color: Vector = [0.5, 0.4, 0.3];
  const scatterColor: Vector = [1, 0.6, 0.2];
  // Each point's opacity, its scatter weight and its lit colour
  const points: [number, number, Vector][] = [
    [0.2, 0, [0.5, 0.4, 0.4]],
    [0.6, 0, [0.2, 0.2, 0.3]],
    [0.5, 1, [0.4, 0.4, 0.3]],
    [0.8, 0.5, [0.65, 0.55, 0.4]],
    [0.1, 0.2, [0.5, 0.4, 0.5]],
  ];
  const round = (vector: Vector): number[] => vector.map((value) => Number(value.toFixed(6)));

  test("recovers the fog's own and sunward colours", () => {
    expect.hasAssertions();

    const solved = solveFogColors(
      points.map(([opacity, scatter, lit]) => ({
        lit,
        opacity,
        reference: ([0, 1, 2] as const).map(
          (channel) =>
            lit[channel] * (1 - opacity) + (color[channel] * (1 - scatter) + scatterColor[channel] * scatter) * opacity,
        ) as Vector,
        scatter,
        weight: 1,
      })),
    );

    expect(round(solved.color)).toStrictEqual(color);
    expect(round(solved.scatterColor)).toStrictEqual(scatterColor);
    expect(solved.residual).toBeLessThan(1e-9);
  });

  test("leaves the sunward colour the fog's own where no point looks toward the sun", () => {
    expect.hasAssertions();

    const samples = [0.2, 0.6].map((opacity) => ({
      lit: [0, 0, 0] as Vector,
      opacity,
      reference: [opacity, opacity, opacity] as Vector,
      scatter: 0,
      weight: 1,
    }));
    const { color: own, scatterColor: sunward } = solveFogColors(samples);

    expect(sunward).toStrictEqual(own);
  });
});
