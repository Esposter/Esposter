import type { CharacterPackUploadGrant } from "#server/models/genshin/CharacterPackUploadGrant";
import type { GenerateCharacterPackUploadSasUrlsInput } from "#server/models/genshin/GenerateCharacterPackUploadSasUrlsInput";
import type { Context } from "#server/trpc/context";

import { MAX_CHARACTER_PACK_SIZE } from "#server/services/genshin/accountCharacterPack/constants";
import { getAccountCharacterPackStagingBlobName } from "#server/services/genshin/accountCharacterPack/getAccountCharacterPackStagingBlobName";
import { generateReservedWriteSasUrl } from "#server/services/storage/generateReservedWriteSasUrl";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { AzureContainer } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// One write target per file, each under a staging name of its own: the staging id is minted here, so a file is uploaded
// Whether or not the account already keeps its bytes, and the keep that refers to it can name only its own grant's upload.
// Each is held against the player's quota for its declared size, as a resource's staged save is
export const generateAccountCharacterPackUploadSasUrls = (
  db: Context["db"],
  userId: string,
  { files }: GenerateCharacterPackUploadSasUrlsInput,
): Promise<CharacterPackUploadGrant[]> => {
  const totalSize = files.reduce((total, { size }) => total + size, 0);
  if (totalSize > MAX_CHARACTER_PACK_SIZE)
    throw getInvalidOperationError(
      Operation.Create,
      "character pack",
      `is larger than ${MAX_CHARACTER_PACK_SIZE} bytes`,
    );
  return Promise.all(
    files.map(async ({ size }) => {
      const stagingId = crypto.randomUUID();
      const sasUrl = await generateReservedWriteSasUrl(
        db,
        userId,
        AzureContainer.GenshinAssets,
        getAccountCharacterPackStagingBlobName(userId, stagingId),
        size,
      );
      return { sasUrl, stagingId };
    }),
  );
};
