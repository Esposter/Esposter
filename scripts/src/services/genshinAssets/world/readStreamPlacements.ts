import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";
import type { WorldStream } from "#src/models/genshinAssets/world/WorldStream";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseStreamingIndex } from "#src/services/genshinAssets/world/parseStreamingIndex";
import { parseStreamingPlacements } from "#src/services/genshinAssets/world/parseStreamingPlacements";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Every placement one of a component's StreamGen streams lays out, read from the blob and index `extract` wrote
export const readStreamPlacements = async (
  component: DerivedAssetComponent,
  { blob, index }: WorldStream,
): Promise<WorldPlacement[]> => {
  const directory = getComponentDirectory(component);
  const [blobBytes, indexBytes] = await Promise.all([
    readFile(join(directory.world, AssetType.MiHoYoBinData, `${blob.name}.dat`)),
    readFile(join(directory.world, AssetType.MonoBehaviour, `${index.name}.dat`)),
  ]);
  return parseStreamingPlacements(blobBytes, parseStreamingIndex(indexBytes));
};
