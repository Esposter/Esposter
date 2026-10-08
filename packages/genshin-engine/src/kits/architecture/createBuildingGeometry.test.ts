import type { BuildingOptions } from "#src/models/kits/architecture/BuildingOptions";

import { createBuildingGeometry } from "#src/kits/architecture/createBuildingGeometry";
import { RoofKind } from "#src/models/kits/architecture/RoofKind";
import { Box3, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createBuildingGeometry, () => {
  const options: BuildingOptions = {
    depth: 6,
    platformHeight: 1,
    roofHeight: 2,
    roofKind: RoofKind.Flat,
    wallHeight: 3,
    wallThickness: 0.5,
    width: 8,
  };

  test("stands the platform on the ground and the flat roof over the walls", () => {
    expect.hasAssertions();

    const geometry = createBuildingGeometry(options);
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();

    expect(min).toStrictEqual(new Vector3(-4, 0, -3));
    expect(max).toStrictEqual(new Vector3(4, 6, 3));
  });

  test("tops the walls with a cone scaled to the footprint's outside edge", () => {
    expect.hasAssertions();

    const geometry = createBuildingGeometry({ ...options, roofKind: RoofKind.Conical });
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();

    expect(min).toStrictEqual(new Vector3(-4, 0, -3));
    expect(max.y).toBe(6);
    expect(max.x).toBeCloseTo(4);
    expect(max.z).toBeCloseTo(3);
  });
});
