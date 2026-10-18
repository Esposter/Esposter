import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

import { HomeFurnishingLimit } from "#src/models/home/HomeFurnishingLimit";
import { getHomeFurnishingLimit } from "#src/services/home/getHomeFurnishingLimit";
import { HOME_INTERIOR_FURNISHING_LIMIT } from "#src/services/home/constants";
import { describe, expect, test } from "vitest";

describe(getHomeFurnishingLimit, () => {
  const AREA_ID = 1;
  const SCENE_ID = 9;
  const CHAIR_ITEM_ID = 1001;
  const TABLE_ITEM_ID = 1002;
  const area: HomeArea = {
    areaId: AREA_ID,
    exterior: true,
    loadLimit: 90,
    orangeLoad: 60,
    redLoad: 80,
    sceneId: SCENE_ID,
  };
  const interiorArea: HomeArea = { ...area, exterior: false };
  const itemIdFurnishingMap = new Map<number, HomeFurnishing>([
    [CHAIR_ITEM_ID, { discountLoad: 10, itemId: CHAIR_ITEM_ID, load: 30 }],
    [TABLE_ITEM_ID, { discountLoad: 20, itemId: TABLE_ITEM_ID, load: 50 }],
  ]);
  const placement = (furnishingItemId: number): HomePlacement => ({
    areaId: AREA_ID,
    furnishingItemId,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    sceneId: SCENE_ID,
  });

  test("placements within the area's count and load pass no limit", () => {
    expect.hasAssertions();

    expect(
      getHomeFurnishingLimit([placement(TABLE_ITEM_ID), placement(TABLE_ITEM_ID)], area, itemIdFurnishingMap),
    ).toBeUndefined();
  });

  test("a load past the area's limit is refused by the load", () => {
    expect.hasAssertions();

    const areaPlacements = [placement(TABLE_ITEM_ID), placement(TABLE_ITEM_ID), placement(CHAIR_ITEM_ID)];

    expect(getHomeFurnishingLimit(areaPlacements, area, itemIdFurnishingMap)).toBe(HomeFurnishingLimit.Load);
  });

  test("a count past the interior area's furnishings is refused by the count", () => {
    expect.hasAssertions();

    const areaPlacements = Array.from({ length: HOME_INTERIOR_FURNISHING_LIMIT + 1 }, () => placement(CHAIR_ITEM_ID));
    const load = [placement(CHAIR_ITEM_ID)];

    expect(getHomeFurnishingLimit(areaPlacements, interiorArea, itemIdFurnishingMap)).toBe(HomeFurnishingLimit.Count);
    expect(getHomeFurnishingLimit(load, interiorArea, itemIdFurnishingMap)).toBeUndefined();
  });
});
