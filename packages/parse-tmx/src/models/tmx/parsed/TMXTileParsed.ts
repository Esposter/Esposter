import type { TMXObjectParsed } from "#src/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTileShared } from "#src/models/tmx/shared/TMXTileShared";

export interface TMXTileParsed extends TMXTileShared {
  animation?: { frames: number[] };
  id: number;
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
  type: string;
}
