import type { CharacterPack } from "#src/models/genshinCharacters/CharacterPack";
import type { CharacterPackFile } from "#src/models/genshinCharacters/CharacterPackFile";
import type { ContainerClient } from "@azure/storage-blob";

import {
  GAME_DATA_CACHE_CONTROL,
  GAME_DATA_REUSE_WINDOW_MS,
  MAX_CONCURRENT_BLOB_UPLOADS,
} from "#src/services/gameData/constants";
import { storeBlob } from "#src/services/gameData/storeBlob";
import { getCharacterPackBlobName } from "#src/services/genshinCharacters/getCharacterPackBlobName";
import { listBlobItems } from "@esposter/db";
import { settleAll } from "@esposter/shared";

// Stores what one account lacks of a pack, and returns how many files it wrote, each cached for good under the pack's
// Hash. A stored file is reused while it is young, and otherwise rewritten with the same bytes, which restarts its age
// So no prune can take it before the lock names its pack
export const publishCharacterPackToTarget = async (
  containerClient: ContainerClient,
  { characterId, files, packHash }: CharacterPack,
  getBody: (file: CharacterPackFile) => Promise<Buffer>,
): Promise<number> => {
  const listedBlobItems = await listBlobItems(containerClient, getCharacterPackBlobName(characterId, packHash, ""));
  const lastModifiedMap = new Map(listedBlobItems.map(({ lastModified, name }) => [name, lastModified] as const));
  const now = Date.now();
  const writes = files.flatMap((file) => {
    const blobName = getCharacterPackBlobName(characterId, packHash, file.path);
    const lastModified = lastModifiedMap.get(blobName);
    if (lastModified !== undefined && now - lastModified.getTime() < GAME_DATA_REUSE_WINDOW_MS) return [];
    return [
      async () => {
        const body = await getBody(file);
        return storeBlob(
          (conditions) =>
            containerClient
              .getBlockBlobClient(blobName)
              .upload(body, body.byteLength, {
                blobHTTPHeaders: {
                  blobCacheControl: GAME_DATA_CACHE_CONTROL,
                  blobContentEncoding: file.isCompressed ? "zstd" : undefined,
                  blobContentType: file.contentType,
                },
                conditions,
              }),
          lastModified === undefined,
        );
      },
    ];
  });
  return (await settleAll(writes, MAX_CONCURRENT_BLOB_UPLOADS)).filter(Boolean).length;
};
