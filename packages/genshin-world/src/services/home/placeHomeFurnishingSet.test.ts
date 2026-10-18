import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

import { placeHomeFurnishingSet } from "#src/services/home/placeHomeFurnishingSet";
import { describe, expect, test } from "vitest";

describe(placeHomeFurnishingSet, () => {
  const SCENE_ID = 2;
  const AREA_ID = 1;
  const LOAD_LIMIT = 100;
  const FIRST_FURNISHING_ID = 3;
  const SECOND_FURNISHING_ID = 4;
  const HEAVY_FURNISHING_ID = 5;
  const areas: HomeArea[] = [
    { areaId: AREA_ID, exterior: false, loadLimit: LOAD_LIMIT, orangeLoad: 60, redLoad: 90, sceneId: SCENE_ID },
  ];
  const furnishings: HomeFurnishing[] = [
    { discountLoad: 40, itemId: FIRST_FURNISHING_ID, load: 40 },
    { discountLoad: 60, itemId: SECOND_FURNISHING_ID, load: 60 },
    { discountLoad: 41, itemId: HEAVY_FURNISHING_ID, load: 41 },
  ];
  const createPlacement = (furnishingItemId: number): HomePlacement => ({
    areaId: AREA_ID,
    furnishingItemId,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    sceneId: SCENE_ID,
  });

  test("a set is placed whole when every furnishing fits", () => {
    expect.hasAssertions();

    const set = [createPlacement(FIRST_FURNISHING_ID), createPlacement(SECOND_FURNISHING_ID)];

    expect(placeHomeFurnishingSet([], set, { areas, furnishings })).toStrictEqual(set);
  });

  test("a set is refused whole when one of its furnishings would pass the area's load", () => {
    expect.hasAssertions();

    const placements = [createPlacement(FIRST_FURNISHING_ID)];
    const set = [createPlacement(SECOND_FURNISHING_ID), createPlacement(HEAVY_FURNISHING_ID)];

    expect(placeHomeFurnishingSet(placements, set, { areas, furnishings })).toBeUndefined();
    expect(placements).toStrictEqual([createPlacement(FIRST_FURNISHING_ID)]);
  });
});
