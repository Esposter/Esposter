import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { FriendshipNamecard } from "#src/models/friendship/FriendshipNamecard";

import { readFriendshipLevels } from "#src/services/friendship/readFriendshipLevels";
import { readFriendshipNamecards } from "#src/services/friendship/readFriendshipNamecards";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { shallowRef } from "vue";

// The Friendship levels and the namecards each character's Friendship opens, read from the hosted game data as the world starts
export const useWorldFriendship = (gameDataBaseUrl: string) => {
  const friendshipLevels = shallowRef<FriendshipLevels>();
  const friendshipNamecards = shallowRef<FriendshipNamecard[]>([]);
  // The Friendship Levels a claim's Companionship EXP is kept under, read from the friendship record. A claim waits while
  // They are unread, since the EXP has no top to stop at without them
  getSynchronizedFunction(() =>
    getResultAsync(() => readFriendshipLevels(gameDataBaseUrl)).match(
      (levels) => {
        friendshipLevels.value = levels;
      },
      (error) => {
        console.error(error);
      },
    ),
  )();
  getSynchronizedFunction(() =>
    getResultAsync(() => readFriendshipNamecards(gameDataBaseUrl)).match(
      (namecards) => {
        friendshipNamecards.value = namecards;
      },
      (error) => {
        console.error(error);
      },
    ),
  )();
  return { friendshipLevels, friendshipNamecards };
};
