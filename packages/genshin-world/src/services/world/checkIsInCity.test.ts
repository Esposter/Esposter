import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { AreaTerrainType } from "#src/models/world/AreaTerrainType";
import { WorldLayer } from "#src/models/world/WorldLayer";
import { checkIsInCity } from "#src/services/world/checkIsInCity";
import { WeatherKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

// An area with one subarea of the kind given, the game splitting it in two: an outline not drawn and a unit square
const createArea = (areaTerrainType: AreaTerrainType): CatalogueArea => ({
  id: "id",
  layer: WorldLayer.Surface,
  name: "name",
  outline: [],
  subareas: [
    {
      areaTerrainType,
      id: "id",
      name: "name",
      outlines: [
        [],
        [
          { x: 0, z: 0 },
          { x: 1, z: 0 },
          { x: 1, z: 1 },
          { x: 0, z: 1 },
        ],
      ],
    },
  ],
  subregion: "",
  weathers: [WeatherKind.Rain],
});

describe(checkIsInCity, () => {
  test.each([
    [AreaTerrainType.City, true],
    [AreaTerrainType.Outdoor, false],
  ])("a place inside one of a %s subarea's outlines is in a city: %s", (areaTerrainType, isInCity) => {
    expect.hasAssertions();

    expect(checkIsInCity(createArea(areaTerrainType), 0.1, 0.1)).toBe(isInCity);
  });
});
