import type { CityArea } from "#src/models/genshinAssets/world/CityArea";

import { ARCHITECTURE_VIEW_METRES } from "#src/services/genshinAssets/world/constants";
import { selectCapitalCityArea } from "#src/services/genshinAssets/world/selectCapitalCityArea";
import { describe, expect, test } from "vitest";

const createCityArea = (code: string, minX: number, minZ: number, maxX: number, maxZ: number): CityArea => ({
  centroid: { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 },
  code,
  extent: { maxX, maxZ, minX, minZ },
  placementCount: 1,
});

describe(selectCapitalCityArea, () => {
  const CITY_AREA = createCityArea("Mengde", -100, -100, 100, 100);
  const FAR_CITY_AREA = createCityArea("LYG", 5000, 5000, 5100, 5100);

  test("picks the city area whose extent contains the capital", () => {
    expect.hasAssertions();

    expect(selectCapitalCityArea([FAR_CITY_AREA, CITY_AREA], { x: 0, z: 0 })).toStrictEqual(CITY_AREA);
  });

  test("picks the nearest centroid within the architecture radius when no extent contains the capital", () => {
    expect.hasAssertions();

    expect(selectCapitalCityArea([CITY_AREA, FAR_CITY_AREA], { x: ARCHITECTURE_VIEW_METRES - 1, z: 0 })).toStrictEqual(
      CITY_AREA,
    );
  });

  test("picks no city area beyond the architecture radius", () => {
    expect.hasAssertions();

    expect(selectCapitalCityArea([CITY_AREA], { x: ARCHITECTURE_VIEW_METRES + 1, z: 0 })).toBeUndefined();
  });
});
