import type { Friend, FriendRequest, FriendRequestWithRelations, User } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface FriendEvents {
  acceptFriendRequest: [{ receiverUser: User; senderUser: User }];
  declineFriendRequest: [Pick<FriendRequest, "receiverId" | "senderId">];
  deleteFriend: [Pick<Friend, "receiverId" | "senderId">];
  sendFriendRequest: [FriendRequestWithRelations];
}

export const friendEventEmitter = new EventEmitter<FriendEvents>();
