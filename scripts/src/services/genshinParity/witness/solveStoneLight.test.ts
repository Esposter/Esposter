import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";

import { computeSkyLobeHarmonics } from "#src/services/genshinParity/witness/computeSkyLobeHarmonics";
import { SKY_LOBE_DIRECTIONS } from "#src/services/genshinParity/witness/constants";
import { solveStoneLight } from "#src/services/genshinParity/witness/solveStoneLight";
import {
  computeStoneHarmonics,
  STONE_HARMONIC_COUNT,
  STONE_HEIGHT_FALLOFF,
  STONE_RAMP_KNOT_COUNT,
} from "genshin-engine";
import { describe, expect, test } from "vitest";

const round = (colors: (readonly number[])[]): number[][] =>
  colors.map((color) => color.map((value) => Number(value.toFixed(2)) + 0));

describe(solveStoneLight, () => {
  // A straight ramp from none at its dark end, which the smoothness the solve holds its bends to leaves as it is
  const ramp = Array.from({ length: STONE_RAMP_KNOT_COUNT }, (_value, knot) => [0.05 * knot, 0.04 * knot, 0.03 * knot]);
  // A sky of two of the solve's own lights, each its own colour, so the solve can draw it exactly
  const [skyLight = [], groundLight = []] = [SKY_LOBE_DIRECTIONS[3] ?? [], SKY_LOBE_DIRECTIONS[20] ?? []].map(
    (direction) => computeSkyLobeHarmonics(direction),
  );
  const [skyColor, groundColor] = [
    [0.5, 0.6, 0.8],
    [0.2, 0.1, 0.05],
  ];
  const harmonics = skyLight.map((value, term) =>
    [0, 1, 2].map(
      (channel) => (skyColor?.[channel] ?? 0) * value + (groundColor?.[channel] ?? 0) * (groundLight[term] ?? 0),
    ),
  );
  const heightFade = [0.2, 0.15, 0.1];
  const haze = { color: [0.6, 0.5, 0.4] satisfies Vector, scatterColor: [1, 0.8, 0.5] satisfies Vector };
  // Every ramp knot's coordinate under faces turned every way, lit by a light fading with height as given, each drawn
  // As many times as a bin needs to be read, the bins split between two parts
  const drawSamples = (fade: readonly number[]): StoneLightSample[] =>
    Array.from({ length: STONE_RAMP_KNOT_COUNT * 6 }, (_value, index): StoneLightSample[] => {
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
      const height = ((index % 11) - 5) * 4;
      const occlusion = 1 - (index % 5) / 10;
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
        const fading = (fade[channel] ?? 0) * Math.exp(-height * STONE_HEIGHT_FALLOFF);
        return (
          (albedo[channel] * (sun + sky + fading) + emission[channel]) * occlusion * (1 - opacity) + hazeColor * opacity
        );
      }) as Vector;
      return Array.from({ length: 30 }, () => ({
        albedo,
        bin: String(index),
        color,
        emission,
        harmonics: terms,
        height,
        occlusion,
        opacity,
        part: index % 2,
        rampCoordinate,
        scatter,
      }));
    }).flat();
  const samples = drawSamples(heightFade);

  test("recovers the ramp, the harmonics and the light fading with height under a known occlusion and haze", () => {
    expect.hasAssertions();

    const { light, residual } = solveStoneLight(samples, haze);

    expect(round(light.ramp)).toStrictEqual(round(ramp));
    expect(round(light.harmonics)).toStrictEqual(round(harmonics));
    expect(round([light.heightFade])).toStrictEqual(round([heightFade]));
    expect(residual).toBeLessThan(1e-4);
  });

  test("solves a scene a free solve would light below none to a light that never is", () => {
    expect.hasAssertions();

    // The night's own trouble: a red that fades below none with height
    const { light } = solveStoneLight(drawSamples([-0.3, 0, 0.8]), haze);

    expect(Math.min(...light.heightFade)).toBeGreaterThanOrEqual(0);
    for (const [knot, color] of light.ramp.entries())
      for (const [channel, value] of color.entries())
        expect(value).toBeGreaterThanOrEqual(light.ramp[knot - 1]?.[channel] ?? 0);
  });

  test("throws when no bin holds enough pixels to read", () => {
    expect.hasAssertions();

    expect(() =>
      solveStoneLight(
        samples.filter((_sample, index) => index % 30 !== 0),
        haze,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: bins, none of 96 holds 30 pixels]`,
    );
  });
});
