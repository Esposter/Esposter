import type { FittedSurface } from "#src/models/genshinAssets/fit/FittedSurface";

// One family's surface as `FittedSurface` fits it over all its samples, and its parts: the same fit over the samples of
// Each material its meshes name, by that name, so a part drawn in its own colour (a statue's figure, a tree's leaves)
// Keeps its own. A ground's family also holds each paint layer's colour as hex in `layers` (`fitGroundLayerColours`)
export interface FittedFamily extends FittedSurface {
  layers?: Record<string, string>;
  parts: Record<string, FittedSurface>;
}
