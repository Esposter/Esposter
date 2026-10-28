import type { UserInAuth } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { db } from "#src/services/shared/db";
import { deleteBlobs } from "@esposter/db";
import { AzureContainer, dataExportsInUser } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The export archive sits under no user prefix, so it is found by the row that names it, before the user row's cascade
// Removes that row. A queued export names no archive yet, and an archive an earlier sweep removed is reported as gone,
// Which deleteBlobs already counts as done
export const deleteAccountDataExportArchives = async (userId: UserInAuth["id"]): Promise<void> => {
  const dataExportRows = await db
    .select({ blobName: dataExportsInUser.blobName })
    .from(dataExportsInUser)
    .where(eq(dataExportsInUser.userId, userId));
  const blobNames = dataExportRows.map(({ blobName }) => blobName).filter((blobName) => blobName !== null);
  const containerClient = await getContainerClient(AzureContainer.UserAssets);
  await deleteBlobs(containerClient, blobNames);
};
