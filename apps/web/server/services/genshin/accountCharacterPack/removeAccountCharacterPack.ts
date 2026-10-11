import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { writeBlobState } from "#server/services/blobState/writeBlobState";
import { getAccountCharacterPacksBlobName } from "#server/services/genshin/accountCharacterPack/getAccountCharacterPacksBlobName";
import { readAccountCharacterPackManifest } from "#server/services/genshin/accountCharacterPack/readAccountCharacterPackManifest";
import { AzureContainer } from "@esposter/db-schema";

// Drops the character's pack from the account's list, which is all that keeps it: the files it named stay stored, since
// Another account may keep the same bytes, and they are read by no account once no list names them
export const removeAccountCharacterPack = async (userId: string, characterId: number): Promise<void> => {
  const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
  const { etag, packs } = await readAccountCharacterPackManifest(containerClient, userId);
  if (!packs.some((pack) => pack.characterId === characterId)) return;
  await writeBlobState(
    containerClient,
    getAccountCharacterPacksBlobName(userId),
    JSON.stringify(packs.filter((pack) => pack.characterId !== characterId)),
    etag,
  );
};
