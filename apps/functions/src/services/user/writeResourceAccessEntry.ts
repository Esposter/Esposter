import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";

// The resources the person opened, each with the time they last opened it, which the row stores
export const writeResourceAccessEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const accesses = await db.query.resourceAccessesInResource.findMany({
    columns: { accessedAt: true, resourceId: true },
    where: { userId: { eq: userId } },
  });
  await archive.addJsonEntry("accesses.json", accesses);
};
