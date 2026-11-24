import type { Catalogue } from "genshin-world";

import { findResidentAreaId } from "#src/services/genshinAssets/residents/findResidentAreaId";
import { WorldLayer } from "genshin-world/definitions";
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
  // The east landmark is the nearest to a place in the west area's east edge, which the outline files under the west
  // Area
  const landmarks = [
    { areaId: "west-area", position: { x: -300, z: 50 } },
    { areaId: "east-area", position: { x: 120, z: 50 } },
  ];

  test("files a place under the area whose outline holds it, not the area of a nearer landmark", () => {
    expect.hasAssertions();

    expect(findResidentAreaId(catalogue, landmarks, { x: 90, z: 50 })).toBe("west-area");
  });

  test("files a place no outline holds under its nearest landmark's area, when that area's outline is in reach", () => {
    expect.hasAssertions();

    expect(findResidentAreaId(catalogue, landmarks, { x: 500, z: 500 })).toBe("east-area");
  });

  test("files no area to a place past the reach of its nearest landmark's area", () => {
    expect.hasAssertions();

    expect(findResidentAreaId(catalogue, landmarks, { x: 5000, z: 5000 })).toBeUndefined();
  });

  test("files a place under its outline's area when the region has no landmark", () => {
    expect.hasAssertions();

    expect(findResidentAreaId(catalogue, [], { x: 50, z: 50 })).toBe("west-area");
  });

  test("files no area to a place no outline holds in a region with no landmark", () => {
    expect.hasAssertions();

    expect(findResidentAreaId(catalogue, [], { x: 500, z: 500 })).toBeUndefined();
  });
});
