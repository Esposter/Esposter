import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const friendRequestsRelation = defineRelationsPart(schema, (r) => ({
  friendRequests: {
    receiver: r.one.users({
      from: r.friendRequests.receiverId,
      optional: false,
      to: r.users.id,
    }),
    sender: r.one.users({
      from: r.friendRequests.senderId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const FriendRequestRelations = {
  receiver: true,
  sender: true,
} as const;
