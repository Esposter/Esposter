import type { CliffFeature } from "#src/models/terrain/CliffFeature";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { getCliffHeight } from "#src/terrain/getCliffHeight";
import { describe, expect, test } from "vitest";

describe(getCliffHeight, () => {
  test("raises the terrace on the left of its segment's direction, out to its width and no further, and fades past its ends", () => {
    expect.hasAssertions();

    // A segment running along x, whose left is the positive z side, a terrace four metres high ten metres across
    const cliff: CliffFeature = {
      endX: 100,
      endZ: 0,
      falloff: 2,
      height: 4,
      kind: TerrainFeatureKind.Cliff,
      startX: 0,
      startZ: 0,
      width: 10,
    };

    expect(getCliffHeight(cliff, 50, 5)).toBe(4);
    expect(getCliffHeight(cliff, 50, -5)).toBe(0);
    expect(getCliffHeight(cliff, 50, 11)).toBe(2);
    expect(getCliffHeight(cliff, 50, 40)).toBe(0);
    expect(getCliffHeight(cliff, 150, 5)).toBe(0);
  });
});
