import type {
  FriendInSocial,
  FriendRequestInSocial,
  FriendRequestInSocialWithRelations,
  PublicUser,
} from "@esposter/db-schema";

export interface FriendEvents {
  acceptFriendRequest: [{ receiverUser: PublicUser; senderUser: PublicUser }];
  declineFriendRequest: [Pick<FriendRequestInSocial, "receiverId" | "senderId">];
  deleteFriend: [Pick<FriendInSocial, "receiverId" | "senderId">];
  sendFriendRequest: [FriendRequestInSocialWithRelations];
}
