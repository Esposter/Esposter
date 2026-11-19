import type { DumpedCity } from "#src/models/genshinText/DumpedCity";

import { toCityRegionMap } from "#src/services/genshinAssets/shared/toCityRegionMap";
import { describe, expect, test } from "vitest";

describe(toCityRegionMap, () => {
  const NOD_KRAI_CITY_ID = 7;
  const SNEZHNAYA_CITY_ID = 8;
  const UNNAMED_CITY_ID = 9;
  const PAHA_ISLE_AREA_ID = 70;
  const VOLKODLAK_TUNDRA_AREA_ID = 55;
  const LUNAR_AREA_ID = 99;
  const areaPlaceMap = new Map([
    [PAHA_ISLE_AREA_ID, { areaId: "paha-isle", region: "nod-krai" }],
    [VOLKODLAK_TUNDRA_AREA_ID, { areaId: "volkodlak-tundra", region: "snezhnaya" }],
  ]);

  test("a city is filed under the region its areas lie in, and a city none of whose areas a region holds has none", () => {
    expect.hasAssertions();

    const cities: DumpedCity[] = [
      { areaIdVec: [PAHA_ISLE_AREA_ID, LUNAR_AREA_ID], cityId: NOD_KRAI_CITY_ID, cityNameTextMapHash: 1 },
      { areaIdVec: [VOLKODLAK_TUNDRA_AREA_ID], cityId: SNEZHNAYA_CITY_ID, cityNameTextMapHash: 2 },
      { areaIdVec: [LUNAR_AREA_ID], cityId: UNNAMED_CITY_ID, cityNameTextMapHash: 3 },
    ];

    expect(toCityRegionMap(cities, areaPlaceMap)).toStrictEqual(
      new Map([
        [NOD_KRAI_CITY_ID, "nod-krai"],
        [SNEZHNAYA_CITY_ID, "snezhnaya"],
      ]),
    );
  });

  test("a city whose areas lie in two regions is refused", () => {
    expect.hasAssertions();

    const cities: DumpedCity[] = [
      { areaIdVec: [PAHA_ISLE_AREA_ID, VOLKODLAK_TUNDRA_AREA_ID], cityId: NOD_KRAI_CITY_ID, cityNameTextMapHash: 1 },
    ];

    expect(() => toCityRegionMap(cities, areaPlaceMap)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: city 7, has areas in nod-krai, snezhnaya]`,
    );
  });
});
