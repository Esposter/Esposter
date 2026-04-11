import type { FriendRequestWithRelations, User } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface FriendEvents {
  acceptFriendRequest: [{ receiverUser: User; senderId: string }];
  declineFriendRequest: [{ receiverId: string; senderId: string }];
  deleteFriend: [{ receiverId: string; senderId: string }];
  sendFriendRequest: [{ friendRequest: FriendRequestWithRelations; receiverId: string }];
}

export const friendEventEmitter = new EventEmitter<FriendEvents>();
