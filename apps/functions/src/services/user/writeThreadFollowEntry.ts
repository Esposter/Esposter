import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";

// The person's own decisions about threads, each with its room and thread, and whether it is an unfollow.
// Each also carries the time of the first decision.
// An unfollow is kept, since it is the person's decision
export const writeThreadFollowEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const follows = await db.query.threadFollowsInMessage.findMany({
    columns: { createdAt: true, isUnfollowed: true, roomId: true, threadRootRowKey: true },
    where: { userId: { eq: userId } },
  });
  await archive.addJsonEntry("follows.json", follows);
};
