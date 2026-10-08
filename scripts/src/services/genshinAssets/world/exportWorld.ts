import type { WorldOptions } from "#src/models/genshinAssets/world/WorldOptions";

import { exportTerrainTiles } from "#src/services/genshinAssets/world/exportTerrainTiles";
import { exportWorldStreams } from "#src/services/genshinAssets/world/exportWorldStreams";

// A set world's own exports into its world folder: each StreamGen blob and index raw, and each terrain tile's TerrainData
// From the blocks its map names. A derived world is exported by its derivation, which reads its placements from them
export const exportWorld = async (world: WorldOptions, directory: string): Promise<void> => {
  exportWorldStreams(world.streams, directory);
  await exportTerrainTiles(
    world.terrainTiles.map(({ name }) => name),
    [...new Set(world.terrainTiles.map(({ block }) => block))],
    directory,
  );
};
