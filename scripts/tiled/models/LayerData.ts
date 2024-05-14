import type { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import type { TMXGroupLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerParsed";

export interface LayerData {
  key: TilemapKey;
  layers: (TMXLayerParsed | TMXGroupLayerParsed)[];
}
