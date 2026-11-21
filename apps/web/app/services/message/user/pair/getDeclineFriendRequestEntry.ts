import type { Entry } from "#src/models/shared/overlay/Entry";

import { friendRequestTable } from "#src/services/message/user/pair/constants";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The request leaves the screen at once, as a tombstone the server's version of it confirms
export const getDeclineFriendRequestEntry = (userId: string, senderId: string, now: Date): Entry =>
  getHeldRowEntry(friendRequestTable, getFriendRowKey(userId, senderId), (friendRequest) => ({
    ...friendRequest,
    deletedAt: now,
  }));
