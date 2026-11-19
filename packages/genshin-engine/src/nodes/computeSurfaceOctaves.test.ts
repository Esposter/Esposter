import { computeSurfaceOctaves } from "#src/nodes/computeSurfaceOctaves";
import { SURFACE_DETAIL_BAND_SIGMAS } from "#src/nodes/constants";
import { describe, expect, test } from "vitest";

describe(computeSurfaceOctaves, () => {
  // A base map's texel spans 2 metres where the ground draws it, 512 texels over a 1,024-metre tile
  const BASE_MAP_METRES_PER_TEXEL = 2;
  // The ground's texture spans 2.3 metres a texel over Windrise's tiles, whose slopes add area, and the plant domes draw
  // The ground's detail at that scale
  const PLANT_DOME_METRES_PER_TEXEL = 2.3;

  test("gives a flat surface no detail", () => {
    expect.hasAssertions();

    const octaves = computeSurfaceOctaves({
      bands: SURFACE_DETAIL_BAND_SIGMAS.map(() => 0),
      metresPerTexel: 1,
      variance: 0,
    });

    expect(octaves.map(({ amplitude }) => amplitude)).toStrictEqual([0, 0, 0, 0, 0]);
  });

  test("a base-map surface's detail reads at its texture's texel size", () => {
    expect.hasAssertions();

    const octaves = computeSurfaceOctaves({
      bands: SURFACE_DETAIL_BAND_SIGMAS.map(() => 1),
      metresPerTexel: BASE_MAP_METRES_PER_TEXEL,
      variance: 1,
    });

    expect(octaves.map(({ frequency }) => frequency)).toStrictEqual([0.45, 0.15, 0.05, 0.0165, 0.0055]);
  });

  test("a plant dome's detail reads at its own texture's scale", () => {
    expect.hasAssertions();

    const octaves = computeSurfaceOctaves({
      bands: SURFACE_DETAIL_BAND_SIGMAS.map(() => 1),
      metresPerTexel: PLANT_DOME_METRES_PER_TEXEL,
      variance: 1,
    });

    expect(octaves.map(({ frequency }) => frequency)).toStrictEqual([
      0.391304347826087, 0.13043478260869565, 0.04347826086956522, 0.014347826086956523, 0.004782608695652174,
    ]);
  });
});
