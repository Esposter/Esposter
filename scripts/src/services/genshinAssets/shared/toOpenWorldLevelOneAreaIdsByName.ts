import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";

import { WorldAreaType } from "#src/models/genshinAssets/world/WorldAreaType";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";

// The open world's level-one areas, each as the English name its text gives it and its id in the game's area table,
// Which the catalogue's areas and the game's outlines are matched by. An area whose text names nothing is left out
export const toOpenWorldLevelOneAreaIdsByName = (
  areas: readonly Pick<WorldArea, "areaID1" | "areaNameTextMapHash" | "areaType" | "sceneID">[],
  textMap: ReadonlyMap<string, string>,
): (readonly [string, number])[] =>
  areas.flatMap(({ areaID1, areaNameTextMapHash, areaType, sceneID }) => {
    const name = textMap.get(String(areaNameTextMapHash));
    return areaType === WorldAreaType.Level1 && sceneID === OPEN_WORLD_SCENE_ID && name !== undefined
      ? [[name, areaID1] as const]
      : [];
  });
