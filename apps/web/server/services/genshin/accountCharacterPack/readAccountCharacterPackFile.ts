import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { downloadBlobBytes } from "#server/services/genshin/accountCharacterPack/downloadBlobBytes";
import { getAccountCharacterPackFileBlobName } from "#server/services/genshin/accountCharacterPack/getAccountCharacterPackFileBlobName";
import { readAccountCharacterPackManifest } from "#server/services/genshin/accountCharacterPack/readAccountCharacterPackManifest";
import { AzureContainer } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A file the account's own list names, by its hash, or undefined where no pack of the account names it, so a file another
// Account keeps is never read for this one. A file the list names but that is not stored is an error, not absent
export const readAccountCharacterPackFile = async (userId: string, sha256: string): Promise<Buffer | undefined> => {
  const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
  const { packs } = await readAccountCharacterPackManifest(containerClient, userId);
  if (!packs.some((pack) => pack.files.some((file) => file.sha256 === sha256))) return undefined;
  const bytes = await downloadBlobBytes(containerClient, getAccountCharacterPackFileBlobName(sha256));
  if (bytes === undefined)
    throw new InvalidOperationError(Operation.Read, sha256, "is named by the account's packs but not stored");
  return bytes;
};
