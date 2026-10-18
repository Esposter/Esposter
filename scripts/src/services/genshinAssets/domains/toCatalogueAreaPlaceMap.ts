import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";

import { toOpenWorldLevelOneAreaIdsByName } from "#src/services/genshinAssets/shared/toOpenWorldLevelOneAreaIdsByName";

// The open world's level-one areas by their id in the game's area table, each with the catalogue area of its English name
// And the region holding it, as `fitAreaOutlines` pairs the game's areas with the catalogue's. An area the catalogue holds
// No name of is left out
export const toCatalogueAreaPlaceMap = ({
  areas,
  regions,
  textMap,
}: {
  areas: readonly Pick<WorldArea, "areaID1" | "areaNameTextMapHash" | "areaType" | "sceneID">[];
  regions: readonly { areas: readonly { id: string; name: string }[]; id: string }[];
  textMap: ReadonlyMap<string, string>;
}): Map<number, { areaId: string; region: string }> => {
  const placeMap = new Map(
    regions.flatMap(({ areas: catalogueAreas, id: region }) =>
      catalogueAreas.map(({ id: areaId, name }) => [name, { areaId, region }] as const),
    ),
  );
  return new Map(
    toOpenWorldLevelOneAreaIdsByName(areas, textMap).flatMap(([name, areaID1]) => {
      const place = placeMap.get(name);
      return place ? [[areaID1, place] as const] : [];
    }),
  );
};
