import type { TMXObjectParsed } from "@/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "@/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTileShared } from "@/models/tmx/shared/TMXTileShared";

export interface TMXTileParsed extends TMXTileShared {
  animation?: { frames: number[] };
  id: number;
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
  type: string;
}
