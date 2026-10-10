import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { LOD_INFO_MAP_NAME } from "#src/services/genshinAssets/world/constants";
import { exportNamedRaw } from "#src/services/genshinAssets/world/exportWorldStreams";
import { parseLodInfoMap } from "#src/services/genshinAssets/world/parseLodInfoMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The game's LOD table exported raw into a world folder and read there: the path hash of each LOD-grouped prefab's
// Finest level by the prefab's world id, the one name its placements carry no path hash for
export const readLodPathHashes = async (worldDirectory: string): Promise<Map<number, string>> => {
  const [asset] = await readIndexedAssets(
    ({ name, type }) => name === LOD_INFO_MAP_NAME && type === AssetType.MonoBehaviour,
  );
  if (!asset) throw new InvalidOperationError(Operation.Read, LOD_INFO_MAP_NAME, "is not in the asset index");
  exportNamedRaw(asset.block, AssetType.MonoBehaviour, [asset.name], worldDirectory);
  return parseLodInfoMap(await readFile(join(worldDirectory, AssetType.MonoBehaviour, `${asset.name}.dat`)));
};
