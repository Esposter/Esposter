import type { TMXLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXGroupLayerShared } from "@/lib/tmxParser/models/tmx/shared/TMXGroupLayerShared";

export interface TMXGroupLayerParsed extends TMXGroupLayerShared {
  layers: TMXLayerParsed[];
  properties?: TMXPropertiesParsed;
}
