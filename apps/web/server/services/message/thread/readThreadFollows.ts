import type { Context } from "#server/trpc/context";
import type { ThreadFollowInMessage } from "@esposter/db-schema";

// The follow rows a member holds in a room, unfiltered: an unfollowed one is a row too, its decision kept with its version,
// So the client applies the unfollow rather than reading its absence as a thread it never followed. Newest root first, since
// A root's id is its room's sequence
export const readThreadFollows = (
  db: Context["db"],
  roomId: string,
  userId: string,
): Promise<ThreadFollowInMessage[]> =>
  db.query.threadFollowsInMessage.findMany({
    orderBy: { threadRootId: "desc" },
    where: { roomId: { eq: roomId }, userId: { eq: userId } },
  });
