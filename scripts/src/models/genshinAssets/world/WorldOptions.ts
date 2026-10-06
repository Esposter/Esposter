import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { IndexedAsset } from "#src/models/genshinAssets/shared/IndexedAsset";
import type { WorldPoint } from "#src/models/genshinAssets/world/WorldPoint";
import type { WorldRegionLandmark } from "#src/models/genshinAssets/world/WorldRegionLandmark";
import type { WorldStream } from "#src/models/genshinAssets/world/WorldStream";

// What a part of the open world is laid out by beyond its roots: the prefab whose first place is the origin of our
// Own scene, so every fitted value stands round it, the prefabs its scene points and its StreamGen blobs place in the
// World, the region data's landmarks they stand, and the terrain tiles under it, each by its TerrainData's block and
// Name
export interface WorldOptions {
  origin: AssetRoot;
  points: WorldPoint[];
  regionLandmarks: WorldRegionLandmark[];
  streams: WorldStream[];
  terrainTiles: Pick<IndexedAsset, "block" | "name">[];
}
