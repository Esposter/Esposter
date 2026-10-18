import type { HomeArea } from "#src/models/home/HomeArea";
import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";
import type { HomePlacement } from "#src/models/home/HomePlacement";

import { HOME_INTERIOR_FURNISHING_LIMIT } from "#src/services/home/constants";
import { placeHomeFurnishing } from "#src/services/home/placeHomeFurnishing";
import { describe, expect, test } from "vitest";

describe(placeHomeFurnishing, () => {
  const SCENE_ID = 2;
  const AREA_ID = 1;
  const OTHER_AREA_ID = 2;
  const EXTERIOR_AREA_ID = 3;
  const LOAD_LIMIT = 100;
  const LIGHT_FURNISHING_ID = 3;
  const HEAVY_FURNISHING_ID = 4;
  const OVER_FURNISHING_ID = 5;
  const REDUCED_FURNISHING_ID = 6;
  const EMPTY_FURNISHING_ID = 7;
  const areas: HomeArea[] = [
    { areaId: AREA_ID, exterior: false, loadLimit: LOAD_LIMIT, orangeLoad: 60, redLoad: 90, sceneId: SCENE_ID },
    { areaId: OTHER_AREA_ID, exterior: false, loadLimit: LOAD_LIMIT, orangeLoad: 60, redLoad: 90, sceneId: SCENE_ID },
    { areaId: EXTERIOR_AREA_ID, exterior: true, loadLimit: LOAD_LIMIT, orangeLoad: 60, redLoad: 90, sceneId: SCENE_ID },
  ];
  const furnishings: HomeFurnishing[] = [
    { discountLoad: 40, itemId: LIGHT_FURNISHING_ID, load: 40 },
    { discountLoad: 60, itemId: HEAVY_FURNISHING_ID, load: 60 },
    { discountLoad: 41, itemId: OVER_FURNISHING_ID, load: 41 },
    { discountLoad: 30, itemId: REDUCED_FURNISHING_ID, load: 60 },
    { discountLoad: 0, itemId: EMPTY_FURNISHING_ID, load: 0 },
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

  test("a second copy of a furnishing takes its reduced load", () => {
    expect.hasAssertions();

    // The first copy takes its full load of 60, the second its reduced 30, so a third's 30 more passes the limit of 100
    const reducedPlacement = createPlacement(REDUCED_FURNISHING_ID);

    expect(placeHomeFurnishing([reducedPlacement], reducedPlacement, { areas, furnishings })).toStrictEqual([
      reducedPlacement,
      reducedPlacement,
    ]);
    expect(
      placeHomeFurnishing([reducedPlacement, reducedPlacement], reducedPlacement, { areas, furnishings }),
    ).toBeUndefined();
  });

  test("a placement past the interior area's furnishing count is refused", () => {
    expect.hasAssertions();

    const emptyPlacement = createPlacement(EMPTY_FURNISHING_ID);
    const fullPlacements = Array.from({ length: HOME_INTERIOR_FURNISHING_LIMIT }, () => emptyPlacement);

    expect(placeHomeFurnishing(fullPlacements.slice(1), emptyPlacement, { areas, furnishings })).toHaveLength(
      HOME_INTERIOR_FURNISHING_LIMIT,
    );
    expect(placeHomeFurnishing(fullPlacements, emptyPlacement, { areas, furnishings })).toBeUndefined();
  });

  test("an exterior area's furnishing count is not the interior limit", () => {
    expect.hasAssertions();

    const exteriorPlacement = createPlacement(EMPTY_FURNISHING_ID, EXTERIOR_AREA_ID);
    const fullPlacements = Array.from({ length: HOME_INTERIOR_FURNISHING_LIMIT }, () => exteriorPlacement);

    expect(placeHomeFurnishing(fullPlacements, exteriorPlacement, { areas, furnishings })).toHaveLength(
      HOME_INTERIOR_FURNISHING_LIMIT + 1,
    );
  });
});
