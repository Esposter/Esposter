import type { User } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface FriendEvents {
  acceptFriendRequest: [{ receiverUser: User; senderId: string }];
  declineFriendRequest: [{ receiverId: string; senderId: string }];
  deleteFriend: [{ receiverId: string; senderId: string }];
  sendFriendRequest: [{ receiverId: string; senderUser: User }];
}

export const friendEventEmitter = new EventEmitter<FriendEvents>();
