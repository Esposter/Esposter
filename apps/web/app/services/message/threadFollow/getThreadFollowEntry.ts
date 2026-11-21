import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { threadFollowTable } from "#src/services/message/threadFollow/constants";
import { getThreadFollowRowKey } from "#src/services/message/threadFollow/getThreadFollowRowKey";

// The member's decision about a thread, set over the row held for it, or over a row the client creates with no version yet.
// A decision is one row, so an unfollow is a row change, not a delete, and the server's row names the version it holds at
export const getThreadFollowEntry =
  (roomId: string, threadRootId: ClientMessage["id"], userId: string, isUnfollowed: boolean, now: Date): Entry =>
  (view) => {
    const key = getThreadFollowRowKey(roomId, threadRootId, userId);
    const threadFollow = view.get(threadFollowTable, key);
    view.set(
      threadFollowTable,
      key,
      threadFollow
        ? { ...threadFollow, isUnfollowed }
        : { createdAt: now, deletedAt: null, isUnfollowed, roomId, threadRootId, updatedAt: now, userId },
    );
  };
