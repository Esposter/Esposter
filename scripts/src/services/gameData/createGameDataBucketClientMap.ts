import { GAME_DATA_PRODUCT } from "#src/services/gameData/constants";
import { createHostedAssetBucketClientMap } from "#src/services/hostedAssets/createHostedAssetBucketClientMap";

// The bucket every game data object is published to. The map is made when this is called, so a caller calls it only
// When a publish needs the bucket
export const createGameDataBucketClientMap = () => createHostedAssetBucketClientMap(GAME_DATA_PRODUCT.bucket);
