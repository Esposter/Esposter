import { computeSurfaceOctaves } from "#src/nodes/computeSurfaceOctaves";
import { SURFACE_DETAIL_BAND_SIGMAS } from "#src/nodes/constants";
import { describe, expect, test } from "vitest";

describe(computeSurfaceOctaves, () => {
  test("gives a flat surface no detail", () => {
    expect.hasAssertions();

    const octaves = computeSurfaceOctaves({ bands: SURFACE_DETAIL_BAND_SIGMAS.map(() => 0), variance: 0 });

    expect(octaves.map(({ amplitude }) => amplitude)).toStrictEqual(octaves.map(() => 0));
  });
});
