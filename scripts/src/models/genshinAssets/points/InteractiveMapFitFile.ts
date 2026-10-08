import type { InteractiveMapRegionFit } from "#src/models/genshinAssets/points/InteractiveMapRegionFit";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";

// What a fit writes to the references folder: the transform it solved, its residual over every matched point, and each
// Region's share of it
export interface InteractiveMapFitFile {
  regions: InteractiveMapRegionFit[];
  residual: number;
  transform: SimilarityTransform;
}
