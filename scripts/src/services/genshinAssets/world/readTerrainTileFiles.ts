import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The raw data of each terrain tile `extract` wrote for a part of the open world, by its name, in the world's order
export const readTerrainTileFiles = async (
  component: DerivedAssetComponent,
): Promise<{ data: Buffer; name: string }[]> => {
  const world = await readWorldOptions(component);
  if (!world) throw new InvalidOperationError(Operation.Read, component, "has no world");
  const directory = getComponentDirectory(component);
  return Promise.all(
    world.terrainTiles.map(async ({ name }) => ({
      data: await readFile(join(directory.world, AssetType.TerrainData, `${name}.dat`)),
      name,
    })),
  );
};
