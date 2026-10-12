import type { ParitySilhouette } from "#src/models/genshinParity/shared/ParitySilhouette";

// A glyph's strokes split from the reference's own pixels, 1 for ink, on the silhouette's own raster
export interface SilhouetteInk {
  isInk: Uint8Array;
  silhouette: ParitySilhouette;
}
