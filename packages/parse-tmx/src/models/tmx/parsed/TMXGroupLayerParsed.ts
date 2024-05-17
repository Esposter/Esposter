import type { TMXLayerParsed } from "@/src/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "@/src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXGroupLayerShared } from "@/src/models/tmx/shared/TMXGroupLayerShared";

export interface TMXGroupLayerParsed extends TMXGroupLayerShared {
  layers: TMXLayerParsed[];
  properties?: TMXPropertiesParsed;
}
