import type { Vector } from "#src/models/shared/Vector";

// One reading of a surface's export texture: its colour as red, green and blue in bytes, and its weight, the area of the
// Face it is read off times how far its texel is covered, so a surface's colour is the mean its area shows. Its part is
// The material its face is drawn with, by name, or empty for a terrain tile's base map, which names no part. Its layer,
// When the surface is split by one, is the paint layer its face is painted in
export interface SurfaceSample {
  colour: Vector;
  layer?: string;
  part: string;
  weight: number;
}
