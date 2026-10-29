import type { ReferenceObjectTarget } from "#src/models/genshinParity/reference/ReferenceObjectTarget";

import { GameDataTarget } from "#src/models/shared/GameDataTarget";
import { GAME_DATA_CACHE_CONTROL } from "#src/services/gameData/constants";
import { createGameDataContainerClient } from "#src/services/gameData/createGameDataContainerClient";

// Both accounts the game data is published to, each answering whether an object is there and uploading one from its file
// with the cache control every immutable object carries. The upload streams the file in blocks, so no object is read
// whole into memory, and no connection is opened until a target is asked
export const createReferenceObjectTargets = (): ReferenceObjectTarget[] =>
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
