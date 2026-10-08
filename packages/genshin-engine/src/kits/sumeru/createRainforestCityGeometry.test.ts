import { createRainforestCityGeometry } from "#src/kits/sumeru/createRainforestCityGeometry";
import { Box3 } from "three";
import { describe, expect, test } from "vitest";

describe(createRainforestCityGeometry, () => {
  test("stacks each tier, its walkway and the dome from the origin up, the first walkway the widest", () => {
    expect.hasAssertions();

    const geometry = createRainforestCityGeometry({
      baseRadius: 6,
      domeHeight: 2,
      domeRadius: 3,
      radialSegments: 8,
      radiusStep: 1,
      tierCount: 2,
      tierHeight: 3,
      walkwayHeight: 0.5,
      walkwayOverhang: 1,
    });
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();

    expect(min.y).toBe(0);
    expect(max.y).toBe(2 * (3 + 0.5) + 2);
    expect(max.x).toBe(6 + 1);
  });
});
