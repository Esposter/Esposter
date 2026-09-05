import { schema } from "#src/schema";
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

export const FriendRequestRelations = {
  receiver: true,
  sender: true,
} as const;
