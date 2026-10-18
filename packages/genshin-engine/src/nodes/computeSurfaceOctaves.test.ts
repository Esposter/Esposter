import { computeSurfaceOctaves } from "#src/nodes/computeSurfaceOctaves";
import { SURFACE_DETAIL_BAND_SIGMAS, SURFACE_OCTAVE_TEXEL_FREQUENCIES } from "#src/nodes/constants";
import { describe, expect, test } from "vitest";

// A base map's texel spans 2 metres where the ground draws it, 512 texels over a 1,024-metre tile
const BASE_MAP_METRES_PER_TEXEL = 2;

describe(computeSurfaceOctaves, () => {
  test("gives a flat surface no detail", () => {
    expect.hasAssertions();

    const octaves = computeSurfaceOctaves({
      bands: SURFACE_DETAIL_BAND_SIGMAS.map(() => 0),
      metresPerTexel: 1,
      variance: 0,
    });

    expect(octaves.map(({ amplitude }) => amplitude)).toStrictEqual(octaves.map(() => 0));
  });

  test("a base-map surface's detail reads at its texture's texel size", () => {
    expect.hasAssertions();

    const octaves = computeSurfaceOctaves({
      bands: SURFACE_DETAIL_BAND_SIGMAS.map(() => 1),
      metresPerTexel: BASE_MAP_METRES_PER_TEXEL,
      variance: 1,
    });

    expect(octaves.map(({ frequency }) => frequency)).toStrictEqual(
      SURFACE_OCTAVE_TEXEL_FREQUENCIES.map((texelFrequency) => texelFrequency / BASE_MAP_METRES_PER_TEXEL),
    );
  });
});
