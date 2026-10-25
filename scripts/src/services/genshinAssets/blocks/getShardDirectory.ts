import { ASSET_MAP_SHARDS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { join } from "node:path";

export const getShardDirectory = (index: number): string => join(ASSET_MAP_SHARDS_DIRECTORY, `${index}`);
