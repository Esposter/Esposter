import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// A glyph a comparison scores alone: the rectangle it stands in, in the reference's own pixels, and its colour there
export interface ParitySilhouette extends ImageRegion {
  // The glyph's colour, red, green and blue, read off the reference's strokes
  ink: [number, number, number];
}
