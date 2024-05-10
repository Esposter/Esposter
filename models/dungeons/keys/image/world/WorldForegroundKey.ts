import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";

type BaseWorldForegroundKey = `World${TilemapKey}Foreground`;
type WorldForegroundKey = {
  [P in BaseWorldForegroundKey]: P;
};

export const WorldForegroundKey = Object.values(TilemapKey).reduce<
  Record<BaseWorldForegroundKey, BaseWorldForegroundKey>
>((acc, curr) => {
  const key = `World${curr}Foreground`;
  acc[key] = key;
  return acc;
}, {}) as WorldForegroundKey;
