import type { TMXAnimationParsed } from "#src/models/tmx/parsed/TMXAnimationParsed";
import type { TMXImageParsed } from "#src/models/tmx/parsed/TMXImageParsed";
import type { TMXObjectParsed } from "#src/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";

export interface TMXTileParsed {
  animation?: TMXAnimationParsed;
  id: number;
  image?: TMXImageParsed;
  objects?: TMXObjectParsed[];
  probability?: number;
  properties?: TMXPropertiesParsed;
  terrain?: string;
  type?: string;
}
