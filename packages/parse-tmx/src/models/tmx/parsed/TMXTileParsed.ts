import type { TMXObjectParsed } from "@/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "@/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTileShared } from "@/models/tmx/shared/TMXTileShared";

export interface TMXTileParsed extends TMXTileShared {
  id: number;
  type: string;
  animation?: { frames: number[] };
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
}
