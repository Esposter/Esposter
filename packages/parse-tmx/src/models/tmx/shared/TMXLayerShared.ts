import type { TMXGroupLayerShared } from "#src/models/tmx/shared/TMXGroupLayerShared";

export interface TMXLayerShared extends TMXGroupLayerShared {
  color?: string;
  draworder?: string;
  height?: number;
  locked?: number;
  width?: number;
  x?: number;
  y?: number;
}
