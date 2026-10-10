import type { CliffFeature } from "#src/models/terrain/CliffFeature";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { getCliffBlend } from "#src/terrain/getCliffBlend";
import { describe, expect, test } from "vitest";

describe(getCliffBlend, () => {
  test("stands the terrace on the left of its segment's direction, out to its width and no further, and fades it past its ends", () => {
    expect.hasAssertions();

    // A segment running along x, whose left is the positive z side, a terrace ten metres across
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

    expect(getCliffBlend(cliff, 50, 5)).toBe(1);
    expect(getCliffBlend(cliff, 50, -5)).toBe(0);
    expect(getCliffBlend(cliff, 50, 11)).toBe(0.5);
    expect(getCliffBlend(cliff, 50, 40)).toBe(0);
    expect(getCliffBlend(cliff, 150, 5)).toBe(0);
  });
});
