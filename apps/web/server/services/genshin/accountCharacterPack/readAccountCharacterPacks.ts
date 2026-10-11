import type { AccountCharacterPackRecord } from "#server/models/genshin/AccountCharacterPackRecord";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { readAccountCharacterPackManifest } from "#server/services/genshin/accountCharacterPack/readAccountCharacterPackManifest";
import { AzureContainer } from "@esposter/db-schema";

export const readAccountCharacterPacks = async (userId: string): Promise<AccountCharacterPackRecord[]> => {
  const containerClient = await useContainerClient(AzureContainer.GenshinAssets);
  const { packs } = await readAccountCharacterPackManifest(containerClient, userId);
  return packs;
};
