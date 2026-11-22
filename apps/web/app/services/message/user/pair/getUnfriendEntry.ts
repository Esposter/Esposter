import type { Entry } from "#src/models/shared/overlay/Entry";

import { friendTable } from "#src/services/message/user/pair/constants";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The friendship leaves the screen at once, as a tombstone the server's version of it confirms
export const getUnfriendEntry = (userId: string, friendId: string, deletedAt: Date): Entry =>
  getHeldRowEntry(friendTable, getFriendRowKey(userId, friendId), (row) => ({ ...row, deletedAt }));
