import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";

// The calls the person started, each with the room and thread it belongs to and the time it started. A call's id is
// The key a knocker presents to join it, so it is left out. The table records who started a call, not who joined it,
// So the other participants are not in the archive
export const writeCallSessionEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const calls = await db.query.callSessionsInMessage.findMany({
    columns: { createdAt: true, roomId: true, threadRootRowKey: true },
    where: { userId: { eq: userId } },
  });
  await archive.addJsonEntry("calls.json", calls);
};
