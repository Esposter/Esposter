import type { TMXObjectParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTileShared } from "@/lib/tmxParser/models/tmx/shared/TMXTileShared";

export interface TMXTileParsed extends TMXTileShared {
  id: number;
  type: string;
  animation?: { frames: number[] };
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
}
