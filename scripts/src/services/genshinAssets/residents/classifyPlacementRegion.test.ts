import { classifyPlacementRegion } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import { describe, expect, test } from "vitest";

describe(classifyPlacementRegion, () => {
  const regionMapPoints = [
    { position: { x: 0, z: 0 }, region: "mondstadt" },
    { position: { x: 100, z: 0 }, region: "liyue" },
  ];

  test("takes the region of the nearest mapped point within the distance", () => {
    expect.hasAssertions();

    expect(classifyPlacementRegion({ x: 70, z: 0 }, regionMapPoints, 50)).toBe("liyue");
    expect(classifyPlacementRegion({ x: 40, z: 0 }, regionMapPoints, 50)).toBe("mondstadt");
  });

  test("takes no region for a place farther than the distance from every mapped point", () => {
    expect.hasAssertions();

    expect(classifyPlacementRegion({ x: 300, z: 0 }, regionMapPoints, 50)).toBeUndefined();
  });
});
