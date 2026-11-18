import type { RegionGround } from "#src/models/world/RegionGround";

import { toLaidGround } from "#src/services/world/toLaidGround";
import { describe, expect, test } from "vitest";

const outline = [
  { x: 0, z: 0 },
  { x: 200, z: 0 },
  { x: 200, z: 200 },
  { x: 0, z: 200 },
];
const regions = [{ areas: [{ id: "area", outline }], id: "region" }];
const ground: RegionGround = { base: 0, features: [], hills: [] };

describe(toLaidGround, () => {
  test("reads a quarter's key as that quarter's square of its area", () => {
    expect.hasAssertions();

    expect(toLaidGround("ground/region/area/3", ground, regions).domain?.squares).toEqual([
      { maxX: 200, maxZ: 200, minX: 100, minZ: 100 },
    ]);
  });

  test("reads a nested key one level at a time, so 3/2 is quarter 2 of quarter 3", () => {
    expect.hasAssertions();

    expect(toLaidGround("ground/region/area/3/2", ground, regions).domain?.squares).toEqual([
      { maxX: 150, maxZ: 200, minX: 100, minZ: 150 },
    ]);
  });

  test("reads a nested group, so 3/1-3 joins quarters 1 and 3 of quarter 3", () => {
    expect.hasAssertions();

    expect(toLaidGround("ground/region/area/3/1-3", ground, regions).domain?.squares).toEqual([
      { maxX: 200, maxZ: 150, minX: 150, minZ: 100 },
      { maxX: 200, maxZ: 200, minX: 150, minZ: 150 },
    ]);
  });
});
