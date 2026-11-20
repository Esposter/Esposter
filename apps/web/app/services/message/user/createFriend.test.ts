import type { FriendInSocialWithRelations, PublicUser } from "@esposter/db-schema";

import { getFriendshipId } from "@esposter/shared";
import { describe } from "vitest";

// The friendship between two users, as the friend store holds it
export const createFriend = (sender: PublicUser, receiver: PublicUser): FriendInSocialWithRelations => ({
  createdAt: new Date(0),
  deletedAt: null,
  id: getFriendshipId(sender.id, receiver.id),
  receiver,
  receiverId: receiver.id,
  sender,
  senderId: sender.id,
  updatedAt: new Date(0),
  version: 0,
});

describe.todo("createFriend");
