import type { ContainerClient } from "@azure/storage-blob";
import type { UserInAuth } from "@esposter/db-schema";

import { deleteDirectory } from "#src/services/azure/container/deleteDirectory";

// Removes everything a user wrote under their own `{userId}/` prefix, in each container given. The trailing slash is
// What keeps one user's prefix from matching another's id, and a prefix with nothing left in it is already done.
export const deleteUserDirectories = async (
  containerClients: ContainerClient[],
  userId: UserInAuth["id"],
): Promise<void> => {
  await Promise.all(containerClients.map((containerClient) => deleteDirectory(containerClient, `${userId}/`)));
};
