import type { Entry } from "#src/models/shared/overlay/Entry";

import { friendTable } from "#src/services/message/user/pair/constants";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";

// The friendship leaves the screen at once, as a tombstone the server's version of it confirms
export const getUnfriendEntry =
  (userId: string, friendId: string, deletedAt: Date): Entry =>
  (view) => {
    const key = getFriendRowKey(userId, friendId);
    const friendship = view.get(friendTable, key);
    if (friendship) view.set(friendTable, key, { ...friendship, deletedAt });
  };
