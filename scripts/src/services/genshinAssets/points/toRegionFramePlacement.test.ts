import { toRegionFramePlacement } from "#src/services/genshinAssets/points/toRegionFramePlacement";
import { describe, expect, test } from "vitest";

describe(toRegionFramePlacement, () => {
  test("carries a game place into the region's axes, its z mirrored about the origin", () => {
    expect.hasAssertions();

    // A place at (130, 20) round an origin at (100, 50) lies at (30, 30) in the region's axes
    const placement = {
      places: { mondstadt: [{ id: "chest-1", kind: "Common", position: { x: 130, z: 20 } }] },
      skippedUnderground: 0,
      skippedUnmapped: 0,
    };
    expect(toRegionFramePlacement(placement, [100, 0, 50]).places).toStrictEqual({
      mondstadt: [{ id: "chest-1", kind: "Common", position: { x: 30, z: 30 } }],
    });
  });
});
