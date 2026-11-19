import type { MaterialSourcePlace } from "#src/models/wildlife/MaterialSourcePlace";

import { getCritterStandInPlaces } from "#src/services/wildlife/getCritterStandInPlaces";
import { describe, expect, test } from "vitest";

describe(getCritterStandInPlaces, () => {
  const CRAB_ITEM_ID = 1001;
  const CHEST_ITEM_ID = 1002;
  const crabA: MaterialSourcePlace = {
    id: "crab-a",
    kind: { hasStandIn: true, itemId: CRAB_ITEM_ID },
    position: { x: 1, z: 2 },
  };
  const crabB: MaterialSourcePlace = {
    id: "crab-b",
    kind: { hasStandIn: true, itemId: CRAB_ITEM_ID },
    position: { x: 3, z: 4 },
  };
  const butterfly: MaterialSourcePlace = {
    id: "butterfly",
    kind: { hasStandIn: false, itemId: CHEST_ITEM_ID },
    position: { x: 5, z: 6 },
  };

  test("a critter stands at each of its points", () => {
    expect.hasAssertions();

    expect(getCritterStandInPlaces([crabA, crabB])).toStrictEqual([crabA, crabB]);
  });

  test("a critter whose picked item is a chest stands at no point", () => {
    expect.hasAssertions();

    expect(getCritterStandInPlaces([crabA, butterfly, crabB])).toStrictEqual([crabA, crabB]);
  });
});
