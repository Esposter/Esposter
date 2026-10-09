import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { STREAM_INDEX_SUFFIX } from "#src/services/genshinAssets/world/constants";
import { getCityStreamName } from "#src/services/genshinAssets/world/getCityStreamName";
import { getPathHashKey } from "#src/services/genshinAssets/world/getPathHashKey";
import { getStreamBlobName } from "#src/services/genshinAssets/world/getStreamBlobName";
import { parseStreamingIndex } from "#src/services/genshinAssets/world/parseStreamingIndex";
import { parseStreamingPlacements } from "#src/services/genshinAssets/world/parseStreamingPlacements";
import { readCapitalCityCode } from "#src/services/genshinAssets/world/readCapitalCityCode";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The keys of the path hashes a capital's city blob's placements carry, each once, read from the blob and index that
// `extract` exported beside the region's exports. Undefined where the region has no city area or no exported blob. A
// Region never extracted is skipped before its city code is resolved, since that may need the city-area file
export const readCityPathKeys = async (component: DerivedAssetComponent): Promise<string[] | undefined> => {
  const { world } = getComponentDirectory(component);
  if (!existsSync(join(world, AssetType.MiHoYoBinData))) return undefined;
  const code = await readCapitalCityCode(component);
  if (!code) return undefined;
  const streamName = getCityStreamName(code);
  const blobPath = join(world, AssetType.MiHoYoBinData, `${getStreamBlobName(streamName)}.dat`);
  const indexPath = join(world, AssetType.MonoBehaviour, `${streamName}${STREAM_INDEX_SUFFIX}.dat`);
  if (!existsSync(blobPath) || !existsSync(indexPath)) return undefined;
  const placements = parseStreamingPlacements(await readFile(blobPath), parseStreamingIndex(await readFile(indexPath)));
  return [...new Set(placements.flatMap(({ pathHash }) => (pathHash ? [getPathHashKey(pathHash)] : [])))];
};
