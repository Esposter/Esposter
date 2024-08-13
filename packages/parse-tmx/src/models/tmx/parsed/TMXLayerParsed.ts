import type { TMXFlipsParsed } from "@/models/tmx/parsed/TMXFlipsParsed";
import type { TMXImageParsed } from "@/models/tmx/parsed/TMXImageParsed";
import type { TMXObjectParsed } from "@/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "@/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXLayerShared } from "@/models/tmx/shared/TMXLayerShared";

export interface TMXLayerParsed extends TMXLayerShared {
  data?: number[];
  flips?: TMXFlipsParsed[];
  image?: TMXImageParsed;
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
}
