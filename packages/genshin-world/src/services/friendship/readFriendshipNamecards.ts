import type { FriendshipNamecard } from "#src/models/friendship/FriendshipNamecard";

import { friendshipNamecardSchema } from "#src/models/friendship/FriendshipNamecard";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The namecards each character's Friendship opens, read from the same friendship slice as the levels and checked against
// Their shape as they arrive
export const readFriendshipNamecards = async (gameDataBaseUrl: string): Promise<FriendshipNamecard[]> => {
  const friendship = await readGameData(
    gameDataBaseUrl,
    "friendship/friendship",
    z.object({ namecards: z.array(friendshipNamecardSchema) }),
  );
  return friendship.namecards;
};
