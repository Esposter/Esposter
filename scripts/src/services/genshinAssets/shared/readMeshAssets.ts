import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The mesh assets the asset index holds under a name, each with its block and path ID. The index lists assets, not
// GameObjects, so a prefab's own name is found in its block's layout instead; a name no mesh holds is refused
export const readMeshAssets = async (
  name: string,
  options: Pick<AnimeStudioOptions, "indexCommand" | "indexPath">,
): Promise<IndexedAsset[]> => {
  const assets = await readIndexedAssets((asset) => asset.type === AssetType.Mesh && asset.name === name, options);
  if (assets.length === 0) throw new InvalidOperationError(Operation.Read, name, "names no mesh in the asset index");
  return assets;
};
