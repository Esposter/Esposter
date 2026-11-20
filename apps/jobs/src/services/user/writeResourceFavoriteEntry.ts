import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getDb } from "#src/services/shared/getDb";

// The resources the person starred, by id, each with the time it was starred
export const writeResourceFavoriteEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const resourceFavorites = await getDb().query.resourceFavoritesInResource.findMany({
    columns: { createdAt: true, resourceId: true },
    where: { userId: { eq: userId } },
  });
  await archive.addJsonEntry("favorites.json", resourceFavorites);
};
