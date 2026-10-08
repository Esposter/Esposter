import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseStreamingIndex } from "#src/services/genshinAssets/world/parseStreamingIndex";
import { parseStreamingPlacements } from "#src/services/genshinAssets/world/parseStreamingPlacements";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The height in the game's axes of a part of the open world's water surface: where the stream naming its water's
// Prefab places it, read from the blob and index `extract` wrote
export const readWorldWaterLevel = async (component: DerivedAssetComponent): Promise<number> => {
  const stream = (await readWorldOptions(component))?.streams.find(({ waterPrefabId }) => waterPrefabId !== undefined);
  if (!stream) throw new InvalidOperationError(Operation.Read, component, "names no stream placing its water");
  const directory = getComponentDirectory(component);
  const [blobBytes, indexBytes] = await Promise.all([
    readFile(join(directory.world, AssetType.MiHoYoBinData, `${stream.blob.name}.dat`)),
    readFile(join(directory.world, AssetType.MonoBehaviour, `${stream.index.name}.dat`)),
  ]);
  const water = parseStreamingPlacements(blobBytes, parseStreamingIndex(indexBytes)).find(
    ({ prefabId }) => prefabId === stream.waterPrefabId,
  );
  if (!water) throw new InvalidOperationError(Operation.Read, stream.blob.name, "places no water");
  return water.position[1];
};
