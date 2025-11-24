import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";

export type WorldForegroundKey = `World${TilemapKey}Foreground`;
type WorldForegroundKeyMap = {
  [P in WorldForegroundKey]: P;
};

export const WorldForegroundKey = Object.fromEntries(
  Object.values(TilemapKey).map((k) => {
    const key: WorldForegroundKey = `World${k}Foreground`;
    return [key, key];
  }),
) as WorldForegroundKeyMap;
