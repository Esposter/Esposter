import type { UserInAuth } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { deleteUserDirectories } from "@esposter/db";
import { StorageBucket } from "@esposter/db-schema";

// The account's own directories are swept by its prefix, which lists no names. The blobs it is charged for went in the
// Step before, through the ledger, so nothing here needs to release a charge
export const deleteAccountBlobDirectories = async (userId: UserInAuth["id"]): Promise<void> => {
  const genshinAssetsClient = await getContainerClient(StorageBucket.GenshinAssets);
  const userContainerClients = await Promise.all(
    [StorageBucket.PublicUserAssets, StorageBucket.UserAssets, StorageBucket.ClickerAssets].map((containerName) =>
      getContainerClient(containerName),
    ),
  );
  await deleteUserDirectories([genshinAssetsClient, ...userContainerClients], userId);
};
