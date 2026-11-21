import type { TMXGroupLayerShared } from "#src/internal/models/tmx/shared/TMXGroupLayerShared";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";

export interface TMXGroupLayerParsed extends TMXGroupLayerShared {
  layers: (TMXGroupLayerParsed | TMXLayerParsed)[];
  properties?: TMXPropertiesParsed;
}
