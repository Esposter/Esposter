import { solveFogColors } from "#src/services/genshinParity/solveFogColors";
import { describe, expect, test } from "vitest";

describe(solveFogColors, () => {
  type Vector = [number, number, number];
  const color: Vector = [0.5, 0.4, 0.3];
  const scatterColor: Vector = [1, 0.6, 0.2];
  // Each point's opacity, its scatter weight and its two lights' colours, the sun's and the sky's
  const points: [number, number, Vector, Vector][] = [
    [0.2, 0, [0.4, 0.3, 0.2], [0.1, 0.1, 0.2]],
    [0.6, 0, [0, 0, 0], [0.2, 0.2, 0.3]],
    [0.5, 1, [0.3, 0.2, 0.1], [0.1, 0.2, 0.2]],
    [0.8, 0.5, [0.6, 0.5, 0.3], [0.05, 0.05, 0.1]],
    [0.1, 0.2, [0.2, 0.1, 0.1], [0.3, 0.3, 0.4]],
  ];
  const hazePoints = (shares: [Vector, Vector]) =>
    points.map(([opacity, scatter, sun, sky]) => ({
      lights: [sun, sky],
      opacity,
      reference: ([0, 1, 2] as const).map(
        (channel) =>
          (sun[channel] * shares[0][channel] + sky[channel] * shares[1][channel]) * (1 - opacity) +
          (color[channel] * (1 - scatter) + scatterColor[channel] * scatter) * opacity,
      ) as Vector,
      scatter,
      weight: 1,
    }));
  const round = (vector: Vector): number[] => vector.map((value) => Number(value.toFixed(6)));

  test("recovers the fog's own and sunward colours from points lit as drawn", () => {
    expect.hasAssertions();

    const solved = solveFogColors(
      hazePoints([
        [1, 1, 1],
        [1, 1, 1],
      ]),
    );

    expect(round(solved.color)).toStrictEqual(color);
    expect(round(solved.scatterColor)).toStrictEqual(scatterColor);
    expect(solved.residual).toBeLessThan(1e-9);
  });

  test("recovers the lights' shares with the fog's colours", () => {
    expect.hasAssertions();

    const shares: [Vector, Vector] = [
      [2, 1.5, 1],
      [0.5, 0.6, 0.8],
    ];
    const solved = solveFogColors(hazePoints(shares), { isLightSolved: true });

    expect(solved.shares.map((share) => round(share))).toStrictEqual(shares);
    expect(round(solved.color)).toStrictEqual(color);
  });

  test("leaves the sunward colour the fog's own where no point looks toward the sun", () => {
    expect.hasAssertions();

    const samples = [0.2, 0.6].map((opacity) => ({
      lights: [[0, 0, 0] as Vector],
      opacity,
      reference: [opacity, opacity, opacity] as Vector,
      scatter: 0,
      weight: 1,
    }));
    const { color: own, scatterColor: sunward } = solveFogColors(samples);

    expect(sunward).toStrictEqual(own);
  });
});
