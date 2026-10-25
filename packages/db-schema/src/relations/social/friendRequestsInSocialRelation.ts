import { schema } from "#src/generated/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const friendRequestsInSocialRelation = defineRelationsPart(schema, (r) => ({
  friendRequestsInSocial: {
    receiver: r.one.usersInAuth({ from: r.friendRequestsInSocial.receiverId, optional: false, to: r.usersInAuth.id }),
    sender: r.one.usersInAuth({ from: r.friendRequestsInSocial.senderId, optional: false, to: r.usersInAuth.id }),
  },
}));

export const FriendRequestInSocialRelations = {
  receiver: { columns: PublicUserColumns },
  sender: { columns: PublicUserColumns },
} as const;
