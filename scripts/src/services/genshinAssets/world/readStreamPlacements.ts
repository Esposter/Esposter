import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";
import type { WorldStream } from "#src/models/genshinAssets/world/WorldStream";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { parseStreamingIndex } from "#src/services/genshinAssets/world/parseStreamingIndex";
import { parseStreamingPlacements } from "#src/services/genshinAssets/world/parseStreamingPlacements";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Every placement one of a world's StreamGen streams lays out, read from the blob and index that `extract` wrote.
// They are read from the World Folder it is given.
export const readStreamPlacements = async (
  worldDirectory: string,
  { blob, index }: WorldStream,
): Promise<WorldPlacement[]> => {
  const [blobBytes, indexBytes] = await Promise.all([
    readFile(join(worldDirectory, AssetType.MiHoYoBinData, `${blob.name}.dat`)),
    readFile(join(worldDirectory, AssetType.MonoBehaviour, `${index.name}.dat`)),
  ]);
  return parseStreamingPlacements(blobBytes, parseStreamingIndex(indexBytes));
};
