import type { FriendshipNamecard } from "#src/models/friendship/FriendshipNamecard";

import { friendshipNamecardSchema } from "#src/models/friendship/FriendshipNamecard";
import { z } from "zod";

// The namecards each character's Friendship opens, read from the same friendship slice as the levels and checked against
// Their shape as they arrive
export const readFriendshipNamecards = async (): Promise<FriendshipNamecard[]> => {
  const { default: friendship } = await import("#src/generated/friendship/friendship.json");
  return z.array(friendshipNamecardSchema).parse(friendship.namecards);
};
