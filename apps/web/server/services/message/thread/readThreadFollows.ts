import type { Context } from "#server/trpc/context";
import type { ThreadFollowInMessage } from "@esposter/db-schema";

// The follow rows a member holds in a room, unfiltered: an unfollowed one is a row too.
// Its decision is kept with its version, so the client applies the unfollow.
// It does not read the absence of a row as a thread the member never followed.
// Newest root first, since a root's id is its room's sequence.
export const readThreadFollows = (
  db: Context["db"],
  roomId: string,
  userId: string,
): Promise<ThreadFollowInMessage[]> =>
  db.query.threadFollowsInMessage.findMany({
    orderBy: { threadRootId: "desc" },
    where: { roomId: { eq: roomId }, userId: { eq: userId } },
  });
