import { ASSET_MAP_NAME } from "#src/services/genshinAssets/shared/constants";

export const getShardMapName = (index: number): string => `${ASSET_MAP_NAME}_shard${index}`;
