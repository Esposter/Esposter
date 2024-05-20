import type { TMXLayerParsed } from "@/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "@/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXGroupLayerShared } from "@/models/tmx/shared/TMXGroupLayerShared";

export interface TMXGroupLayerParsed extends TMXGroupLayerShared {
  layers: TMXLayerParsed[];
  properties?: TMXPropertiesParsed;
}
