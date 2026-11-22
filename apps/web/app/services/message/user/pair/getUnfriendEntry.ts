import type { Entry } from "#src/models/shared/overlay/Entry";

import { friendTable } from "#src/services/message/user/pair/constants";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { getRemovalEntry } from "#src/services/shared/overlay/getRemovalEntry";

// The friendship leaves the screen at once, as a tombstone the server's version of it confirms
export const getUnfriendEntry = (userId: string, friendId: string, deletedAt: Date): Entry =>
  getRemovalEntry(friendTable, getFriendRowKey(userId, friendId), deletedAt);
