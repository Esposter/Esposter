import { BaseTilesetKey } from "@/shared/generated/tiled/propertyTypes/enum/BaseTilesetKey";
import { mergeObjectsStrict } from "@esposter/shared";

export const ExtraTilesetKey = {
  Dungeon: "Dungeon",
} as const;

export const TilesetKey = mergeObjectsStrict(BaseTilesetKey, ExtraTilesetKey);
export type TilesetKey = keyof typeof TilesetKey;
