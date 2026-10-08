import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";

import { MIN_BIN_COUNT } from "#src/services/genshinParity/witness/constants";
import { readStoneColourDistance } from "#src/services/genshinParity/witness/readStoneColourDistance";
import { STONE_HARMONIC_COUNT, STONE_RAMP_KNOT_COUNT, toneMapGenshin } from "genshin-engine";
import { Matrix3 } from "three";
import { describe, expect, test } from "vitest";

const createSamples = (bin: string, albedo: Vector, display: Vector, height: number): StoneLightSample[] =>
  Array.from({ length: MIN_BIN_COUNT }, () => ({
    albedo,
    bin,
    display,
    emission: [0, 0, 0],
    harmonics: Array.from({ length: STONE_HARMONIC_COUNT }, () => 0),
    height,
    lightBin: "",
    occlusion: 1,
    opacity: 0,
    part: 0,
    rampCoordinate: 1,
    scatter: 0,
  }));

describe(readStoneColourDistance, () => {
  test("reads each bin's shown colour against the light's, weighed by its pixels, over the stone and by height", () => {
    expect.hasAssertions();

    const light = {
      harmonics: Array.from({ length: STONE_HARMONIC_COUNT }, () => [0, 0, 0]),
      hazeColor: [0, 0, 0],
      hazeScatterColor: [0, 0, 0],
      heightFade: [0, 0, 0],
      ramp: Array.from({ length: STONE_RAMP_KNOT_COUNT }, () => [100, 100, 100]),
    };
    // Unlit stone shown as the curve shows none, and white stone shown black under a light past the curve's top
    const samples = [
      ...createSamples("low", [0, 0, 0], toneMapGenshin([0, 0, 0]), 0),
      ...createSamples("high", [1, 1, 1], [0, 0, 0], 50),
    ];
    const { distance, heights } = readStoneColourDistance(samples, light, new Matrix3());

    expect({
      distance: Math.round(distance),
      heights: heights.map(({ count, distance: heightDistance, top }) => [count, Math.round(heightDistance), top]),
    }).toStrictEqual({
      distance: 50,
      heights: [
        [MIN_BIN_COUNT, 0, 5],
        [MIN_BIN_COUNT, 100, Infinity],
      ],
    });
  });
});
