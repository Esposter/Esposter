import type { IndexedAsset } from "#src/models/genshinAssets/shared/IndexedAsset";

// A city area the asset index names by its index, with the blob its placements are read from
export interface CityAreaCandidate {
  blob: IndexedAsset;
  code: string;
  index: IndexedAsset;
}
