import type { FriendRequestInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { describe } from "vitest";

// The pending request one user sends another, as the friend request store holds it
export const createFriendRequest = (sender: PublicUser, receiver: PublicUser): FriendRequestInSocialWithRelations => ({
  createdAt: new Date(0),
  deletedAt: null,
  id: `${sender.id}-${receiver.id}`,
  receiverId: receiver.id,
  sender,
  senderId: sender.id,
  updatedAt: new Date(0),
  version: 0,
});

describe.todo("createFriendRequest");
