import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";

import { computeFishingPointPlaces } from "#src/services/fishing/computeFishingPointPlaces";
import { describe, expect, test } from "vitest";

describe(computeFishingPointPlaces, () => {
  const REGION_ID = "1";
  const point: FishingPointPlace = { id: "1", position: { x: 1, z: 2 } };
  const fishingPoints = { [REGION_ID]: [point] };

  test("a point with fish left shows its ring", () => {
    expect.hasAssertions();

    expect(computeFishingPointPlaces(fishingPoints, [REGION_ID], () => true)).toStrictEqual([point]);
  });

  test("a point whose stock is empty shows no ring", () => {
    expect.hasAssertions();

    expect(computeFishingPointPlaces(fishingPoints, [REGION_ID], () => false)).toStrictEqual([]);
  });
});
