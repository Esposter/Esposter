import type { Entry } from "#src/models/shared/overlay/Entry";

import { friendRequestTable, friendTable } from "#src/services/message/user/pair/constants";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";

// An accept removes the request and holds the friendship in the request's direction, as the server does. Both rows are
// Read before either is written, so the keys the entry touches are the same whichever of them is held
export const getAcceptFriendRequestEntry =
  (userId: string, senderId: string, now: Date): Entry =>
  (view) => {
    const key = getFriendRowKey(userId, senderId);
    const friendRequest = view.get(friendRequestTable, key);
    const friendship = view.get(friendTable, key);
    if (!friendRequest) return;

    view.set(friendRequestTable, key, { ...friendRequest, deletedAt: now });
    const direction = { receiverId: friendRequest.receiverId, senderId: friendRequest.senderId };
    view.set(
      friendTable,
      key,
      friendship
        ? { ...friendship, ...direction, deletedAt: null }
        : { ...direction, createdAt: now, deletedAt: null, id: key[0], updatedAt: now },
    );
  };
