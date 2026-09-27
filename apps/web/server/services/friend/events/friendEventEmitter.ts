import type { Friend, FriendRequest, FriendRequestWithRelations, PublicUser } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface FriendEvents {
  acceptFriendRequest: [{ receiverUser: PublicUser; senderUser: PublicUser }];
  declineFriendRequest: [Pick<FriendRequest, "receiverId" | "senderId">];
  deleteFriend: [Pick<Friend, "receiverId" | "senderId">];
  sendFriendRequest: [FriendRequestWithRelations];
}

export const friendEventEmitter = new EventEmitter<FriendEvents>();
