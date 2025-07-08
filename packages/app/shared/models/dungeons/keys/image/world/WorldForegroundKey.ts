import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";

export type WorldForegroundKey = `World${TilemapKey}Foreground`;
type WorldForegroundKeyMap = {
  [P in WorldForegroundKey]: P;
};

export const WorldForegroundKey = Object.values(TilemapKey).reduce(
  (acc, curr) => {
    const key: WorldForegroundKey = `World${curr}Foreground`;
    acc[key] = key;
    return acc;
  },
  {} as Record<WorldForegroundKey, WorldForegroundKey>,
) as WorldForegroundKeyMap;
