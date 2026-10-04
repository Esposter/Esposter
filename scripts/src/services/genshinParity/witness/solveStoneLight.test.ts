import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";

import { solveStoneLight } from "#src/services/genshinParity/witness/solveStoneLight";
import { computeStoneHarmonics, STONE_HARMONIC_COUNT, STONE_RAMP_KNOT_COUNT } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(solveStoneLight, () => {
  // A straight ramp from none at its dark end, which the smoothness the solve holds its bends to leaves as it is
  const ramp = Array.from({ length: STONE_RAMP_KNOT_COUNT }, (_, knot) => [0.05 * knot, 0.04 * knot, 0.03 * knot]);
  const harmonics = [
    [0.5, 0.6, 0.8],
    [0.1, 0, -0.1],
    [0.3, 0.3, 0.4],
    [0, 0.1, 0.1],
    [-0.1, 0, 0.05],
    [0.05, 0.05, 0],
    [0, -0.05, 0.1],
    [0.1, 0.05, 0],
    [-0.05, 0, 0.05],
  ];
  const haze = { color: [0.6, 0.5, 0.4] satisfies Vector, scatterColor: [1, 0.8, 0.5] satisfies Vector };
  const round = (colors: (readonly number[])[]): number[][] =>
    colors.map((color) => color.map((value) => Number(value.toFixed(2)) + 0));
  // Every ramp knot's coordinate under faces turned every way, each drawn as many times as a bin needs to be read
  const samples = Array.from({ length: STONE_RAMP_KNOT_COUNT * 6 }, (_, index): StoneLightSample[] => {
    const rampCoordinate = (index % STONE_RAMP_KNOT_COUNT) / (STONE_RAMP_KNOT_COUNT - 1);
    const turn = Math.floor(index / STONE_RAMP_KNOT_COUNT);
    const azimuth = turn + index * 0.37;
    const elevation = ((turn % 3) - 1) * 0.7 + (index % 5) * 0.1;
    const normal = [
      Math.cos(elevation) * Math.cos(azimuth),
      Math.sin(elevation),
      Math.cos(elevation) * Math.sin(azimuth),
    ];
    const terms = Array.from({ length: STONE_HARMONIC_COUNT }, () => 0);
    computeStoneHarmonics(normal, terms);
    const albedo: Vector = [0.4 + 0.02 * (index % 7), 0.35 + 0.03 * (index % 4), 0.3];
    const opacity = (index % 9) / 20;
    const scatter = (index % 4) / 4;
    const emission: Vector = [0.01 * (index % 3), 0, 0.02];
    const color = ([0, 1, 2] as const).map((channel) => {
      const position = rampCoordinate * (STONE_RAMP_KNOT_COUNT - 1);
      const knot = Math.min(Math.floor(position), STONE_RAMP_KNOT_COUNT - 2);
      const share = position - knot;
      const sun = (ramp[knot]?.[channel] ?? 0) * (1 - share) + (ramp[knot + 1]?.[channel] ?? 0) * share;
      const sky = terms.reduce((sum, value, term) => sum + value * (harmonics[term]?.[channel] ?? 0), 0);
      const hazeColor = (1 - scatter) * haze.color[channel] + scatter * haze.scatterColor[channel];
      return (albedo[channel] * (sun + sky) + emission[channel]) * (1 - opacity) + hazeColor * opacity;
    }) as Vector;
    return Array.from({ length: 30 }, () => ({
      albedo,
      bin: String(index),
      color,
      emission,
      harmonics: terms,
      opacity,
      rampCoordinate,
      scatter,
    }));
  }).flat();

  test("recovers the ramp and the harmonics under a known haze", () => {
    expect.hasAssertions();

    const { light, residual } = solveStoneLight(samples, haze);

    expect(round(light.ramp)).toStrictEqual(round(ramp));
    expect(round(light.harmonics)).toStrictEqual(round(harmonics));
    expect(residual).toBeLessThan(1e-4);
  });
});
