import { findNearestLandmarkAreaId } from "#src/services/genshinAssets/residents/findNearestLandmarkAreaId";
import { describe, expect, test } from "vitest";

describe(findNearestLandmarkAreaId, () => {
  const landmarks = [
    { areaId: "galesong-hill", position: { x: 0, z: 0 } },
    { areaId: "starfell-valley", position: { x: 100, z: 0 } },
  ];

  test("files a place under the area of its nearest landmark", () => {
    expect.hasAssertions();

    expect(findNearestLandmarkAreaId("mondstadt", landmarks, { x: 70, z: 0 })).toBe("starfell-valley");
  });

  test("throws for a region with no landmark", () => {
    expect.hasAssertions();

    expect(() => findNearestLandmarkAreaId("mondstadt", [], { x: 0, z: 0 })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: mondstadt, has no landmark to file a resident under]`,
    );
  });
});
