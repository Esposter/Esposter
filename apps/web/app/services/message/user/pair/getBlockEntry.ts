import type { Entry } from "#src/models/shared/overlay/Entry";

import { blockTable, friendRequestTable, friendTable } from "#src/services/message/user/pair/constants";
import { getBlockRowKey } from "#src/services/message/user/pair/getBlockRowKey";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";

// A block removes the pair's friendship and request and holds the block, all at once. Every row is read before any is
// Written, so the keys the entry touches do not depend on which rows are held
export const getBlockEntry =
  (userId: string, blockedId: string, now: Date): Entry =>
  (view) => {
    const friendKey = getFriendRowKey(userId, blockedId);
    const friendship = view.get(friendTable, friendKey);
    const friendRequest = view.get(friendRequestTable, friendKey);
    const blockKey = getBlockRowKey(userId, blockedId);
    const block = view.get(blockTable, blockKey);
    if (friendship) view.set(friendTable, friendKey, { ...friendship, deletedAt: now });
    if (friendRequest) view.set(friendRequestTable, friendKey, { ...friendRequest, deletedAt: now });
    view.set(
      blockTable,
      blockKey,
      block
        ? { ...block, deletedAt: null }
        : { blockedId, blockerId: userId, createdAt: now, deletedAt: null, updatedAt: now },
    );
  };
