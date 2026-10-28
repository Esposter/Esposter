import type { CharacterPackFile } from "#src/models/genshinAssets/characterPacks/CharacterPackFile";

import { GameDataTarget } from "#src/models/shared/GameDataTarget";
import { MAX_CONCURRENT_BLOB_UPLOADS } from "#src/services/gameData/constants";
import { createGameDataContainerClient } from "#src/services/gameData/createGameDataContainerClient";
import { settleAll } from "@esposter/shared";

// Every file uploads to both accounts over the name it publishes under, replacing what an account holds there, so a
// Rerun publishes whatever the packs now hold. Caches revalidate, since a rerun replaces a file in place
export const publishCharacterPacks = async (files: CharacterPackFile[]): Promise<void> => {
  await Promise.all(
    Object.values(GameDataTarget).map(async (target) => {
      const containerClient = createGameDataContainerClient(target);
      await settleAll(
        files.map(
          ({ blobName, localPath }) =>
            () =>
              containerClient
                .getBlockBlobClient(blobName)
                .uploadFile(localPath, { blobHTTPHeaders: { blobCacheControl: "no-cache" } }),
        ),
        MAX_CONCURRENT_BLOB_UPLOADS,
      );
    }),
  );
};
