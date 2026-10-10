import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { ContainerClient } from "@azure/storage-blob";

import { GAME_DATA_CACHE_CONTROL } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { storeBlob } from "#src/services/gameData/storeBlob";
import { uploadCompressedJson } from "@esposter/db";

// Resolves to whether this call wrote the object, under its hash and cached for good
export const storeGameDataRecord = (
  containerClient: ContainerClient,
  record: GameDataRecord,
  compressedJson: Buffer,
  isCreateOnly: boolean,
): Promise<boolean> =>
  storeBlob(
    (conditions) =>
      uploadCompressedJson(containerClient, getGameDataBlobName(record.hash), compressedJson, {
        cacheControl: GAME_DATA_CACHE_CONTROL,
        conditions,
      }),
    isCreateOnly,
  );
