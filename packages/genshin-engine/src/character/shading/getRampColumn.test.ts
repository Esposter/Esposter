import {
  DEFAULT_LIGHT_AREA,
  DEFAULT_RAMP_WIDTH,
  FLAT_LIGHT_MAP,
  HALF_LAMBERT_OFFSET,
  HALF_LAMBERT_SCALE,
} from "#src/character/shading/constants";
import { getRampColumn } from "#src/character/shading/getRampColumn";
import { getToonThreshold } from "#src/character/shading/getToonThreshold";
import { describe, expect, test } from "vitest";

describe(getRampColumn, () => {
  test("reads the ramp's right end where the threshold reaches the light area", () => {
    expect.hasAssertions();

    expect(getRampColumn(1, 1, 0.5)).toBe(1);
  });

  test("reads the left end where the threshold falls a band short of the light area", () => {
    expect.hasAssertions();

    expect(getRampColumn(0, 1, 0.5)).toBe(0);
  });

  test("reads the threshold a quarter of the way into the band as its middle column", () => {
    expect.hasAssertions();

    // X = (1 - 0.75) / 1 / 0.5 = 0.5, so u = 1 - x
    expect(getRampColumn(0.75, 1, 0.5)).toBeCloseTo(0.5);
  });

  test("reads a pack's toon as MMD does under the defaults and the flat lightmap", () => {
    expect.hasAssertions();

    const [, lightMapGreen] = FLAT_LIGHT_MAP;

    for (const cosine of [-1, -0.5, 0, 0.5, 1]) {
      const threshold = getToonThreshold({
        isLightMapAo: true,
        isVertexAo: false,
        lightMapGreen,
        sunTerm: HALF_LAMBERT_SCALE * cosine + HALF_LAMBERT_OFFSET,
        vertexAo: 1,
      });

      expect(getRampColumn(threshold, DEFAULT_LIGHT_AREA, DEFAULT_RAMP_WIDTH)).toBeCloseTo(0.5 + 0.5 * cosine);
    }
  });
});
