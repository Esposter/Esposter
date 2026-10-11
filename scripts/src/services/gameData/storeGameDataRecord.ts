import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { ContainerClient } from "@azure/storage-blob";

import { GAME_DATA_CACHE_CONTROL } from "#src/services/gameData/constants";
import { getGameDataBlobName } from "#src/services/gameData/getGameDataBlobName";
import { checkIsAlreadyStored, uploadCompressedJson } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";

// Resolves to whether this call wrote the object. A create-only write that finds the object already there is not an error:
// The same bytes under the same name are the state being asked for, so it resolves false
export const storeGameDataRecord = (
  containerClient: ContainerClient,
  record: GameDataRecord,
  compressedJson: Buffer,
  isCreateOnly: boolean,
): Promise<boolean> =>
  getResultAsync(() =>
    uploadCompressedJson(containerClient, getGameDataBlobName(record.hash), compressedJson, {
      cacheControl: GAME_DATA_CACHE_CONTROL,
      conditions: isCreateOnly ? { ifNoneMatch: "*" } : undefined,
    }),
  ).match(
    () => true,
    (error) => {
      if (isCreateOnly && checkIsAlreadyStored(error)) return false;
      throw error;
    },
  );
