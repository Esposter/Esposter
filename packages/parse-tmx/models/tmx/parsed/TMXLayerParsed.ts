import type { TMXFlipsParsed } from "parse-tmx/models/tmx/parsed/TMXFlipsParsed";
import type { TMXImageParsed } from "parse-tmx/models/tmx/parsed/TMXImageParsed";
import type { TMXObjectParsed } from "parse-tmx/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "parse-tmx/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXLayerShared } from "parse-tmx/models/tmx/shared/TMXLayerShared";

export interface TMXLayerParsed extends TMXLayerShared {
  data?: number[];
  image?: TMXImageParsed;
  flips?: TMXFlipsParsed[];
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
}
