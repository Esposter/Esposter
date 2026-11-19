import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";

import { computeFishingLure } from "#src/services/fishing/computeFishingLure";
import { describe, expect, test } from "vitest";

describe(computeFishingLure, () => {
  const point: FishingPointPlace = { id: "1", position: { x: 1, z: 2 } };

  test("a cast shows the rod and the float", () => {
    expect.hasAssertions();

    expect(computeFishingLure({ isLineOut: true, point })).toStrictEqual(point.position);
  });

  test("reeling in clears the rod and the float", () => {
    expect.hasAssertions();

    expect(computeFishingLure({ isLineOut: false, point })).toBeUndefined();
  });
});
