import type { TMXChunkParsed } from "#src/models/tmx/parsed/TMXChunkParsed";
import type { TMXFlipsParsed } from "#src/models/tmx/parsed/TMXFlipsParsed";
import type { TMXImageParsed } from "#src/models/tmx/parsed/TMXImageParsed";
import type { TMXObjectParsed } from "#src/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXGroupLayerShared } from "#src/models/tmx/shared/TMXGroupLayerShared";

export interface TMXLayerParsed extends TMXGroupLayerShared {
  chunks?: TMXChunkParsed[];
  color?: string;
  data?: number[];
  draworder?: string;
  flips?: TMXFlipsParsed[];
  height?: number;
  image?: TMXImageParsed;
  locked?: number;
  objects?: TMXObjectParsed[];
  properties?: TMXPropertiesParsed;
  width?: number;
  x?: number;
  y?: number;
}
