import type { UserInAuth } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { deleteCharacterPackStaging, deleteUserDirectories } from "@esposter/db";
import { AzureContainer } from "@esposter/db-schema";

// The account's own directories are swept by its prefix, which lists no names. The blobs it is charged for went in the
// Step before, through the ledger, so nothing here needs to release a charge
export const deleteAccountBlobDirectories = async (userId: UserInAuth["id"]): Promise<void> => {
  const genshinAssetsClient = await getContainerClient(AzureContainer.GenshinAssets);
  const userContainerClients = await Promise.all(
    [AzureContainer.PublicUserAssets, AzureContainer.UserAssets, AzureContainer.ClickerAssets].map((containerName) =>
      getContainerClient(containerName),
    ),
  );
  await Promise.all([
    deleteUserDirectories([genshinAssetsClient, ...userContainerClients], userId),
    deleteCharacterPackStaging(genshinAssetsClient, userId),
  ]);
};
