import type { ComponentDirectory } from "#src/models/genshinAssets/shared/ComponentDirectory";
import type { WorldOptions } from "#src/models/genshinAssets/world/WorldOptions";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { formatTerrainObj } from "#src/services/genshinAssets/world/formatTerrainObj";
import { parseTerrainHeights } from "#src/services/genshinAssets/world/parseTerrainHeights";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A part of the open world's own data beside its closure: each terrain tile's heightfield, read from its TerrainData
// Already exported into the world folder, written as a mesh among the component's meshes, which the witness draws as
// It draws every export. Returns what was written, and every tile not found
export const extractWorld = async (world: WorldOptions, directory: ComponentDirectory): Promise<string[]> => {
  const tileNames = world.terrainTiles.map(({ name }) => name);
  const terrainDirectory = join(directory.world, AssetType.TerrainData);
  const meshDirectory = join(directory.assets, AssetType.Mesh);
  await mkdir(meshDirectory, { recursive: true });
  const lines = [`${world.streams.length} streams`];
  for (const name of tileNames) {
    const path = join(terrainDirectory, `${name}.dat`);
    // oxlint-disable-next-line no-await-in-loop -- one tile at a time, each some megabytes
    const heights = existsSync(path) ? parseTerrainHeights(await readFile(path)) : undefined;
    if (!heights) {
      lines.push(`terrain ${name}: no heightfield found`);
      continue;
    }
    // oxlint-disable-next-line no-await-in-loop -- as above
    await writeFile(join(meshDirectory, `${name}.obj`), formatTerrainObj(name, heights));
    lines.push(`terrain ${name}: ${heights.resolution} samples a side, ${heights.spacing} metres apart`);
  }
  return lines;
};
