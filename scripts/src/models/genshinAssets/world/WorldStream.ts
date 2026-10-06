import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { IndexedAsset } from "#src/models/genshinAssets/shared/IndexedAsset";

// One StreamGen blob of the world's, by its block and the name AnimeStudio exports it under (its path's PathHashLast in
// Hex), with the index of its chunks by block and name, each prefab of its placements laid out, by the world's 32-bit
// Id the placements draw it by, and the id of the prefab that is the region's water surface where the stream places it
export interface WorldStream {
  blob: Pick<IndexedAsset, "block" | "name">;
  index: Pick<IndexedAsset, "block" | "name">;
  prefabs: { prefab: AssetRoot; prefabId: number }[];
  waterPrefabId?: number;
}
