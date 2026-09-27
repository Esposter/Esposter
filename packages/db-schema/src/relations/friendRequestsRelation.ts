import type { FriendRequest } from "#src/schema/friendRequests";
import type { PublicUser } from "#src/models/user/PublicUser";

import { schema } from "#src/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const friendRequestsRelation = defineRelationsPart(schema, (r) => ({
  friendRequests: {
    receiver: r.one.users({ from: r.friendRequests.receiverId, optional: false, to: r.users.id }),
    sender: r.one.users({ from: r.friendRequests.senderId, optional: false, to: r.users.id }),
  },
}));

export const FriendRequestRelations = {
  receiver: { columns: PublicUserColumns },
  sender: { columns: PublicUserColumns },
} as const;

export type FriendRequestWithRelations = FriendRequest & { receiver: PublicUser; sender: PublicUser };
