import type { GroundPoint } from "genshin-engine";

import { selectGroundKeysInReach } from "#src/services/world/selectGroundKeysInReach";
import { describe, expect, test } from "vitest";

// A square of twenty metres centred on the point
const createSquare = (x: number, z: number): GroundPoint[] => [
  { x: x - 10, z: z - 10 },
  { x: x + 10, z: z - 10 },
  { x: x + 10, z: z + 10 },
  { x: x - 10, z: z + 10 },
];

// Area b lies ten kilometres off, far beyond the reach of a point at the origin
const regions = [
  {
    areas: [
      { id: "area-a", outline: createSquare(0, 0) },
      { id: "area-b", outline: createSquare(10000, 10000) },
    ],
    id: "fontaine",
  },
];

describe(selectGroundKeysInReach, () => {
  test("does not select a piece of an area out of reach", () => {
    expect.hasAssertions();

    expect(
      selectGroundKeysInReach(
        regions,
        ["ground/fontaine/area-a", "ground/fontaine/area-b", "ground/fontaine/area-b/0"],
        0,
        0,
      ),
    ).toStrictEqual(["ground/fontaine/area-a"]);
  });

  test("selects a region's own record while one of its areas is in reach", () => {
    expect.hasAssertions();

    expect(selectGroundKeysInReach(regions, ["ground/fontaine"], 0, 0)).toStrictEqual(["ground/fontaine"]);
  });

  test("selects no region's own record while none of its areas is in reach", () => {
    expect.hasAssertions();

    expect(selectGroundKeysInReach(regions, ["ground/fontaine"], 5000, 5000)).toStrictEqual([]);
  });

  test("selects every quarter of an area in reach", () => {
    expect.hasAssertions();

    expect(
      selectGroundKeysInReach(regions, ["ground/fontaine/area-a/0", "ground/fontaine/area-a/3"], 0, 0),
    ).toStrictEqual(["ground/fontaine/area-a/0", "ground/fontaine/area-a/3"]);
  });
});
