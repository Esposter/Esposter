import type { TMXAnimationParsed } from "#src/models/tmx/parsed/TMXAnimationParsed";
import type { TMXImageParsed } from "#src/models/tmx/parsed/TMXImageParsed";
import type { TMXObjectParsed } from "#src/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTileShared } from "#src/models/tmx/shared/TMXTileShared";

export interface TMXTileParsed extends TMXTileShared {
  animation?: TMXAnimationParsed;
  image?: TMXImageParsed;
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
}
