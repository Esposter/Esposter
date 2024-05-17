import type { TMXLayerParsed } from "parse-tmx/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "parse-tmx/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXGroupLayerShared } from "parse-tmx/models/tmx/shared/TMXGroupLayerShared";

export interface TMXGroupLayerParsed extends TMXGroupLayerShared {
  layers: TMXLayerParsed[];
  properties?: TMXPropertiesParsed;
}
