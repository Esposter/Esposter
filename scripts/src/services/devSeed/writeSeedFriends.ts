import type { Database } from "@esposter/db-schema";

import { SEED_DATE, SEED_FRIEND_USER_ID } from "#src/services/devSeed/constants";
import { friendsInSocial } from "@esposter/db-schema";
import { DRIVEN_USER_ID, getFriendshipId } from "@esposter/shared";

// One accepted friendship between the driven user and the seed's friend, keyed by its natural id
export const writeSeedFriends = async (db: Database): Promise<void> => {
  await db
    .insert(friendsInSocial)
    .values({
      createdAt: SEED_DATE,
      id: getFriendshipId(DRIVEN_USER_ID, SEED_FRIEND_USER_ID),
      receiverId: SEED_FRIEND_USER_ID,
      senderId: DRIVEN_USER_ID,
      updatedAt: SEED_DATE,
    })
    .onConflictDoNothing();
};
