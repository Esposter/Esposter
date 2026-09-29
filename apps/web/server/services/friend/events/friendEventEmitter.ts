import type {
  FriendInSocial,
  FriendRequestInSocial,
  FriendRequestInSocialWithRelations,
  PublicUser,
} from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface FriendEvents {
  acceptFriendRequest: [{ receiverUser: PublicUser; senderUser: PublicUser }];
  declineFriendRequest: [Pick<FriendRequestInSocial, "receiverId" | "senderId">];
  deleteFriend: [Pick<FriendInSocial, "receiverId" | "senderId">];
  sendFriendRequest: [FriendRequestInSocialWithRelations];
}

export const friendEventEmitter = new EventEmitter<FriendEvents>();
