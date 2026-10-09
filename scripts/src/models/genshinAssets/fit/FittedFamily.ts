import type { FittedSurface } from "#src/models/genshinAssets/fit/FittedSurface";

// One family's surface as `FittedSurface` fits it over all its samples, and its parts: the same fit over the samples of
// Each material its meshes name, by that name, so a part drawn in its own colour (a statue's figure, a tree's leaves)
// Keeps its own. When its samples are split by a paint layer, `layers` holds each layer's mean colour as hex
export interface FittedFamily extends FittedSurface {
  layers?: Record<string, string>;
  parts: Record<string, FittedSurface>;
}
