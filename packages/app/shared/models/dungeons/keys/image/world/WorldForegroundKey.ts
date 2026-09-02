import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { TilemapKeys } from "#shared/models/dungeons/keys/TilemapKey";

export type WorldForegroundKey = `World${TilemapKey}Foreground`;
type WorldForegroundKeyMap = {
  [P in WorldForegroundKey]: P;
};

export const WorldForegroundKey = Object.fromEntries(
  TilemapKeys.map((tilemapKey) => {
    const key: WorldForegroundKey = `World${tilemapKey}Foreground`;
    return [key, key];
  }),
) as WorldForegroundKeyMap;
