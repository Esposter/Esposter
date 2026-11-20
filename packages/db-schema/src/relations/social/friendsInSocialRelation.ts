import { schema } from "#src/generated/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const friendsInSocialRelation = defineRelationsPart(schema, (r) => ({
  friendsInSocial: {
    receiver: r.one.usersInAuth({ from: r.friendsInSocial.receiverId, optional: false, to: r.usersInAuth.id }),
    sender: r.one.usersInAuth({ from: r.friendsInSocial.senderId, optional: false, to: r.usersInAuth.id }),
  },
}));

// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const FriendInSocialRelations = {
  receiver: { columns: PublicUserColumns },
  sender: { columns: PublicUserColumns },
} as const;
