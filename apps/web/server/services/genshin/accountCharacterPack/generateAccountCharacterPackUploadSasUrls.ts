import type { GenerateCharacterPackUploadSasUrlsInput } from "#server/models/genshin/GenerateCharacterPackUploadSasUrlsInput";
import type { Context } from "#server/trpc/context";

import { MAX_CHARACTER_PACK_SIZE } from "#server/services/genshin/accountCharacterPack/constants";
import { getAccountCharacterPackStagingBlobName } from "#server/services/genshin/accountCharacterPack/getAccountCharacterPackStagingBlobName";
import { generateReservedWriteSasUrl } from "#server/services/storage/generateReservedWriteSasUrl";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { AzureContainer } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// One write target per file, each under its keep's staging name for its hash, so a file is uploaded whether or not
// The account already keeps its bytes: the server reads what lands there before it refers to it. Each is held against the
// Player's quota for its declared size, as a resource's staged save is
export const generateAccountCharacterPackUploadSasUrls = (
  db: Context["db"],
  userId: string,
  { files, keepId }: GenerateCharacterPackUploadSasUrlsInput,
): Promise<string[]> => {
  const totalSize = files.reduce((total, { size }) => total + size, 0);
  if (totalSize > MAX_CHARACTER_PACK_SIZE)
    throw getInvalidOperationError(
      Operation.Create,
      "character pack",
      `is larger than ${MAX_CHARACTER_PACK_SIZE} bytes`,
    );
  return Promise.all(
    files.map(({ sha256, size }) =>
      generateReservedWriteSasUrl(
        db,
        userId,
        AzureContainer.GenshinAssets,
        getAccountCharacterPackStagingBlobName(userId, keepId, sha256),
        size,
      ),
    ),
  );
};
