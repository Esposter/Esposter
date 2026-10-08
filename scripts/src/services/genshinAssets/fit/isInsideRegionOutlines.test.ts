import type { GroundPoint } from "genshin-engine";

import { isInsideRegionOutlines } from "#src/services/genshinAssets/fit/isInsideRegionOutlines";
import { describe, expect, test } from "vitest";

describe(isInsideRegionOutlines, () => {
  const SQUARE: GroundPoint[] = [
    { x: 0, z: 0 },
    { x: 10, z: 0 },
    { x: 10, z: 10 },
    { x: 0, z: 10 },
  ];
  const OTHER_SQUARE: GroundPoint[] = SQUARE.map(({ x, z }) => ({ x: x + 20, z }));

  test("holds a point inside any of its outlines and none outside them", () => {
    expect.hasAssertions();

    expect({
      inside: isInsideRegionOutlines([SQUARE, OTHER_SQUARE], 25, 5),
      outside: isInsideRegionOutlines([SQUARE, OTHER_SQUARE], 15, 5),
    }).toStrictEqual({ inside: true, outside: false });
  });

  test("holds every point of a region the catalogue gives no outline", () => {
    expect.hasAssertions();

    expect(isInsideRegionOutlines([], 5000, -5000)).toBe(true);
  });
});
