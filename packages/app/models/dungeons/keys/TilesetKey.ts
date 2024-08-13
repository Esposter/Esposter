import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";

import { BaseTilesetKey } from "@/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import { mergeObjectsStrict } from "@/util/object/mergeObjectsStrict";
import { validateType } from "@/util/types/validateType";

const ExtraTilesetKey = {
  Dungeon: "Dungeon",
} as const;

export const TilesetKey = validateType<
  {
    // TilesetKey uses the same namespace as ImageKey & SpritesheetKey
    // so we need to validate that we can't have conflicting key names
    [P in ImageKey]?: never;
  } & {
    [P in SpritesheetKey]?: never;
  } & Record<string, string>
>()(mergeObjectsStrict(BaseTilesetKey, ExtraTilesetKey));
export type TilesetKey = keyof typeof TilesetKey;
