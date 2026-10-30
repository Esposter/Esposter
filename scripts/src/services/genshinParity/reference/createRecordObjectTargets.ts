import type { RecordObjectTarget } from "#src/models/genshinParity/reference/RecordObjectTarget";

import { GameDataTarget } from "#src/models/shared/GameDataTarget";
import { GAME_DATA_CACHE_CONTROL } from "#src/services/gameData/constants";
import { createGameDataContainerClient } from "#src/services/gameData/createGameDataContainerClient";

// Both accounts the game data is published to. Each answers whether an object is there, and uploads one from its file.
// Each upload carries the cache control every immutable object carries.
// The upload streams the file in blocks, so no object is read whole into memory.
// No connection is opened until a target is asked
export const createRecordObjectTargets = (): RecordObjectTarget[] =>
  Object.values(GameDataTarget).map((target) => {
    const containerClient = createGameDataContainerClient(target);
    return {
      exists: (blobName) => containerClient.getBlockBlobClient(blobName).exists(),
      upload: async (blobName, localPath) => {
        await containerClient
          .getBlockBlobClient(blobName)
          .uploadFile(localPath, { blobHTTPHeaders: { blobCacheControl: GAME_DATA_CACHE_CONTROL } });
      },
    };
  });
