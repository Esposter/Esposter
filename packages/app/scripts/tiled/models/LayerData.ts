import type { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import type { TMXGroupLayerParsed, TMXLayerParsed } from "parse-tmx";

export interface LayerData {
  key: TilemapKey;
  layers: (TMXGroupLayerParsed | TMXLayerParsed)[];
}
