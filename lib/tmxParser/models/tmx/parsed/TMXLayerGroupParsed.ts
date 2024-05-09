import type { TMXLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXLayerGroupShared } from "@/lib/tmxParser/models/tmx/shared/TMXLayerGroupShared";

export interface TMXLayerGroupParsed extends TMXLayerGroupShared {
  layers: TMXLayerParsed[];
  properties?: TMXPropertiesParsed;
}
