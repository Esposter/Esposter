import type { TMXObjectParsed } from "parse-tmx/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "parse-tmx/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTileShared } from "parse-tmx/models/tmx/shared/TMXTileShared";

export interface TMXTileParsed extends TMXTileShared {
  id: number;
  type: string;
  animation?: { frames: number[] };
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
}
