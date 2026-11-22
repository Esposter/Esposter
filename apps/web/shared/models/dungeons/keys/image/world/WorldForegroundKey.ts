import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";

import { TilemapKeys } from "#shared/models/dungeons/keys/TilemapKey";
import { typedFromEntries } from "@esposter/shared";

export type WorldForegroundKey = `World${TilemapKey}Foreground`;
type WorldForegroundKeyMap = {
  [P in WorldForegroundKey]: P;
};

export const WorldForegroundKey: WorldForegroundKeyMap = typedFromEntries(
  TilemapKeys.map((tilemapKey) => {
    const key: WorldForegroundKey = `World${tilemapKey}Foreground`;
    return [key, key];
  }),
);
