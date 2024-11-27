import type { TilemapKey } from "@/shared/generated/tiled/propertyTypes/enum/TilemapKey";

import { extractFirstWordFromPascalCaseString } from "@/scripts/util/extractFirstWordFromPascalCaseString";

export const getTilemapDirectory = (tilemapKey: TilemapKey) => {
  const worldTilemapKey = extractFirstWordFromPascalCaseString(tilemapKey);
  // We need to determine whether this map is a root tilemap e.g. a field map
  // or a submap that the player has been teleported into e.g. a building map
  return worldTilemapKey === tilemapKey ? worldTilemapKey : `${worldTilemapKey}/${tilemapKey}`;
};
