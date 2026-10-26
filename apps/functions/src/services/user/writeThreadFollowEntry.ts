import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";

// The person's own decisions about threads, each with its room and thread, and whether the decision is an unfollow. An
// unfollow is kept, since it is the person's decision, and a follow stores no time, so none is written
export const writeThreadFollowEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const follows = await db.query.threadFollowsInMessage.findMany({
    columns: { isUnfollowed: true, roomId: true, threadRootRowKey: true },
    where: { userId: { eq: userId } },
  });
  await archive.addJsonEntry("follows.json", follows);
};
