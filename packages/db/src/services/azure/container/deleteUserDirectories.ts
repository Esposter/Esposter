import type { ContainerClient } from "@azure/storage-blob";
import type { UserInAuth } from "@esposter/db-schema";

import { deleteDirectory } from "#src/services/azure/container/deleteDirectory";

// Removes everything a user wrote under their own `{userId}/` prefix, in each container given, and the character-pack
// Uploads they have staged under `character-packs/staging/{userId}/` in the game-asset container. The trailing slash is
// What keeps one user's prefix from matching another's id, and a prefix with nothing left in it is already done.
export const deleteUserDirectories = async (
  containerClients: ContainerClient[],
  gameAssetContainerClient: ContainerClient,
  userId: UserInAuth["id"],
): Promise<void> => {
  await Promise.all([
    ...containerClients.map((containerClient) => deleteDirectory(containerClient, `${userId}/`)),
    deleteDirectory(gameAssetContainerClient, `character-packs/staging/${userId}/`),
  ]);
};
