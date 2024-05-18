import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";

type BaseWorldForegroundKey = `World${TilemapKey}Foreground`;
type WorldForegroundKey = {
  [P in BaseWorldForegroundKey]: P;
};

export const WorldForegroundKey = Object.values(TilemapKey).reduce(
  (acc, curr) => {
    const key: BaseWorldForegroundKey = `World${curr}Foreground`;
    acc[key] = key;
    return acc;
  },
  {} as Record<BaseWorldForegroundKey, BaseWorldForegroundKey>,
) as WorldForegroundKey;
