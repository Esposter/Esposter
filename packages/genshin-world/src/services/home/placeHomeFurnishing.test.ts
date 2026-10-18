import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

import { placeHomeFurnishing } from "#src/services/home/placeHomeFurnishing";
import { describe, expect, test } from "vitest";

describe(placeHomeFurnishing, () => {
  const SCENE_ID = 2;
  const AREA_ID = 1;
  const OTHER_AREA_ID = 2;
  const LOAD_LIMIT = 100;
  const LIGHT_FURNISHING_ID = 3;
  const HEAVY_FURNISHING_ID = 4;
  const OVER_FURNISHING_ID = 5;
  const areas: HomeArea[] = [
    { areaId: AREA_ID, loadLimit: LOAD_LIMIT, sceneId: SCENE_ID },
    { areaId: OTHER_AREA_ID, loadLimit: LOAD_LIMIT, sceneId: SCENE_ID },
  ];
  const furnishings: HomeFurnishing[] = [
    { itemId: LIGHT_FURNISHING_ID, load: 40 },
    { itemId: HEAVY_FURNISHING_ID, load: 60 },
    { itemId: OVER_FURNISHING_ID, load: 41 },
  ];
  const createPlacement = (furnishingItemId: number, areaId: number = AREA_ID): HomePlacement => ({
    areaId,
    furnishingItemId,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    sceneId: SCENE_ID,
  });
  const heavyPlacement = createPlacement(HEAVY_FURNISHING_ID);

  test("a placement within the area's load is kept", () => {
    expect.hasAssertions();

    const lightPlacement = createPlacement(LIGHT_FURNISHING_ID);

    // The load of the two comes to the area's limit exactly, which is within it
    expect(placeHomeFurnishing([heavyPlacement], lightPlacement, { areas, furnishings })).toStrictEqual([
      heavyPlacement,
      lightPlacement,
    ]);
  });

  test("a placement past the area's load is refused", () => {
    expect.hasAssertions();

    expect(
      placeHomeFurnishing([heavyPlacement], createPlacement(OVER_FURNISHING_ID), { areas, furnishings }),
    ).toBeUndefined();
  });

  test("a placement in another area does not count against this area's load", () => {
    expect.hasAssertions();

    const otherAreaPlacement = createPlacement(HEAVY_FURNISHING_ID, OTHER_AREA_ID);

    expect(placeHomeFurnishing([otherAreaPlacement], heavyPlacement, { areas, furnishings })).toStrictEqual([
      otherAreaPlacement,
      heavyPlacement,
    ]);
  });
});
