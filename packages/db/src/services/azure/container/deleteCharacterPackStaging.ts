import type { ContainerClient } from "@azure/storage-blob";
import type { UserInAuth } from "@esposter/db-schema";

import { deleteDirectory } from "#src/services/azure/container/deleteDirectory";
import { getCharacterPackStagingPrefix } from "#src/services/azure/container/getCharacterPackStagingPrefix";

// Removes a user's character-pack uploads that were staged and never kept. They sit outside `{userId}/`, so the user's
// Own prefix sweep does not reach them. The shared `character-packs/files/` are never under this prefix, so no sweep of
// A staging prefix can remove a file another account references
export const deleteCharacterPackStaging = async (
  gameAssetContainerClient: ContainerClient,
  userId: UserInAuth["id"],
): Promise<void> => {
  await deleteDirectory(gameAssetContainerClient, getCharacterPackStagingPrefix(userId));
};
