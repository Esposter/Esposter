import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";

import { WorldAreaType } from "#src/models/genshinAssets/world/WorldAreaType";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";

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
    areas
      .filter(({ areaType, sceneID }) => areaType === WorldAreaType.Level1 && sceneID === OPEN_WORLD_SCENE_ID)
      .flatMap(({ areaID1, areaNameTextMapHash }) => {
        const place = placeMap.get(textMap.get(String(areaNameTextMapHash)) ?? "");
        return place ? [[areaID1, place] as const] : [];
      }),
  );
};
