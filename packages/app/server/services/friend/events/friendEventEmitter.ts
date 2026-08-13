import type { FriendRequestWithRelations, User } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface FriendEvents {
  acceptFriendRequest: [{ receiverId: string; receiverUser: User; senderId: string; senderUser: User }];
  declineFriendRequest: [{ receiverId: string; senderId: string }];
  deleteFriend: [{ receiverId: string; senderId: string }];
  sendFriendRequest: [{ friendRequest: FriendRequestWithRelations; receiverId: string; senderId: string }];
}

export const friendEventEmitter = new EventEmitter<FriendEvents>();
