import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";

// The person's own search queries across rooms, each with the filters it ran with and the room it searched. A search row
// stores no time, so none is written
export const writeSearchHistoryEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const searches = await db.query.searchHistoriesInMessage.findMany({
    columns: { filters: true, query: true, roomId: true },
    where: { userId: { eq: userId } },
  });
  await archive.addJsonEntry("searches.json", searches);
};
