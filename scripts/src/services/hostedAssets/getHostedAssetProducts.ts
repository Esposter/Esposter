import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { GAME_DATA_PRODUCT } from "#src/services/gameData/constants";

// Every product the hosted-assets tools cover: a product is one declaration here, and its lock is filled, verified and
// Published with the rest, so a product added later needs nothing else edited
export const getHostedAssetProducts = (): HostedAssetProduct[] => [GAME_DATA_PRODUCT];
