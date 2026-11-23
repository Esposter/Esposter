import type { HostedAssetLock } from "hosted-assets";

import { GAME_DATA_LOCK_PATH } from "#src/services/gameData/constants";
import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";

// Read from disk on every call, never from genshin-world's build, which holds the lock of its last build rather than the one
// An earlier step just wrote
export const readGameDataLock = (): Promise<HostedAssetLock> => readHostedAssetLock(GAME_DATA_LOCK_PATH);
