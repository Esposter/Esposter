import type { TMXFlipsParsed } from "@/src/models/tmx/parsed/TMXFlipsParsed";
import type { TMXImageParsed } from "@/src/models/tmx/parsed/TMXImageParsed";
import type { TMXObjectParsed } from "@/src/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "@/src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXLayerShared } from "@/src/models/tmx/shared/TMXLayerShared";

export interface TMXLayerParsed extends TMXLayerShared {
  data?: number[];
  image?: TMXImageParsed;
  flips?: TMXFlipsParsed[];
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
}
