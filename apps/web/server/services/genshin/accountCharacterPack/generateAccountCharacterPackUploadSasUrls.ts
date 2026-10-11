import type { GenerateCharacterPackUploadSasUrlsInput } from "#server/models/genshin/GenerateCharacterPackUploadSasUrlsInput";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { MAX_CHARACTER_PACK_SIZE } from "#server/services/genshin/accountCharacterPack/constants";
import { getAccountCharacterPackStagingBlobName } from "#server/services/genshin/accountCharacterPack/getAccountCharacterPackStagingBlobName";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { generateWriteSasUrl } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// One write target per file, each under the player's own staging name for its hash, so a file is uploaded whether or not
// The account already keeps its bytes: the server reads what lands there before it refers to it
export const generateAccountCharacterPackUploadSasUrls = async (
  userId: string,
  { files }: GenerateCharacterPackUploadSasUrlsInput,
): Promise<string[]> => {
  const totalSize = files.reduce((total, { size }) => total + size, 0);
  if (totalSize > MAX_CHARACTER_PACK_SIZE)
    throw getInvalidOperationError(
      Operation.Create,
      "character pack",
      `is larger than ${MAX_CHARACTER_PACK_SIZE} bytes`,
    );
  const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
  return Promise.all(
    files.map(({ sha256 }) =>
      generateWriteSasUrl(containerClient.getBlockBlobClient(getAccountCharacterPackStagingBlobName(userId, sha256)), {
        contentType: "application/octet-stream",
      }),
    ),
  );
};
