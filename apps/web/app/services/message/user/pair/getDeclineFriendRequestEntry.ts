import type { Entry } from "#src/models/shared/overlay/Entry";

import { friendRequestTable } from "#src/services/message/user/pair/constants";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";

// The request leaves the screen at once, as a tombstone the server's version of it confirms
export const getDeclineFriendRequestEntry =
  (userId: string, senderId: string, now: Date): Entry =>
  (view) => {
    const key = getFriendRowKey(userId, senderId);
    const friendRequest = view.get(friendRequestTable, key);
    if (friendRequest) view.set(friendRequestTable, key, { ...friendRequest, deletedAt: now });
  };
