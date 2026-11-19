import type { Catalogue } from "genshin-world";

import { findResidentAreaId } from "#src/services/genshinAssets/residents/findResidentAreaId";
import { WorldLayer } from "genshin-world";
import { describe, expect, test } from "vitest";

// An area whose outline is the square between the two x values and z from 0 to 100
const square = (id: string, minX: number, maxX: number) => ({
  id,
  layer: WorldLayer.Surface,
  name: id,
  outline: [
    { x: minX, z: 0 },
    { x: maxX, z: 0 },
    { x: maxX, z: 100 },
    { x: minX, z: 100 },
  ],
  subareas: [],
  subregion: "",
  weathers: [],
});

describe(findResidentAreaId, () => {
  const catalogue: Catalogue = {
    regions: [
      { areas: [square("west-area", 0, 100), square("east-area", 100, 200)], id: "mondstadt", name: "Mondstadt" },
    ],
  };
  // The east landmark is the nearest to a place in the west area's east edge, which the outline files under the west area
  const landmarks = [
    { areaId: "west-area", position: { x: -300, z: 50 } },
    { areaId: "east-area", position: { x: 120, z: 50 } },
  ];

  test("files a place under the area whose outline holds it, not the area of a nearer landmark", () => {
    expect.hasAssertions();

    expect(findResidentAreaId("mondstadt", catalogue, landmarks, { x: 90, z: 50 })).toBe("west-area");
  });

  test("files a place no outline holds under the area of its nearest landmark", () => {
    expect.hasAssertions();

    expect(findResidentAreaId("mondstadt", catalogue, landmarks, { x: 500, z: 500 })).toBe("east-area");
  });

  test("files a place under its outline's area when the region has no landmark", () => {
    expect.hasAssertions();

    expect(findResidentAreaId("mondstadt", catalogue, [], { x: 50, z: 50 })).toBe("west-area");
  });

  test("throws for a place no outline holds in a region with no landmark", () => {
    expect.hasAssertions();

    expect(() => findResidentAreaId("mondstadt", catalogue, [], { x: 500, z: 500 })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: mondstadt, has no landmark to file a resident under]`,
    );
  });
});
