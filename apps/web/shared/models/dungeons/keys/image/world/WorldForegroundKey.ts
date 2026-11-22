import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";

import { TilemapKeys } from "#shared/models/dungeons/keys/TilemapKey";

export type WorldForegroundKey = `World${TilemapKey}Foreground`;
type WorldForegroundKeyMap = {
  [P in WorldForegroundKey]: P;
};

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the keys are each tilemap's name built at run time, which Object.fromEntries types as a bare string index that no per-key mapped type overlaps
export const WorldForegroundKey = Object.fromEntries(
  TilemapKeys.map((tilemapKey) => {
    const key: WorldForegroundKey = `World${tilemapKey}Foreground`;
    return [key, key];
  }),
) as WorldForegroundKeyMap;
