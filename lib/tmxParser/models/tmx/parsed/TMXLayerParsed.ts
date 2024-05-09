import type { TMXFlipsParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXFlipsParsed";
import type { TMXImageParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXImageParsed";
import type { TMXObjectParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXLayerShared } from "@/lib/tmxParser/models/tmx/shared/TMXLayerShared";

export interface TMXLayerParsed extends TMXLayerShared {
  data?: number[];
  image?: TMXImageParsed;
  flips?: TMXFlipsParsed[];
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
}
