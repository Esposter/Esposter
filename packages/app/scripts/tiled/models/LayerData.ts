import type { TilemapKey } from "@/shared/generated/tiled/propertyTypes/enum/TilemapKey";
import type { TMXGroupLayerParsed, TMXLayerParsed } from "parse-tmx";

export interface LayerData {
  key: TilemapKey;
  layers: (TMXGroupLayerParsed | TMXLayerParsed)[];
}
