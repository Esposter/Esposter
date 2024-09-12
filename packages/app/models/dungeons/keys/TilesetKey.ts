import { BaseTilesetKey } from "@/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import { mergeObjectsStrict } from "@/util/object/mergeObjectsStrict";

export const ExtraTilesetKey = {
  Dungeon: "Dungeon",
} as const;

export const TilesetKey = mergeObjectsStrict(BaseTilesetKey, ExtraTilesetKey);
export type TilesetKey = keyof typeof TilesetKey;
