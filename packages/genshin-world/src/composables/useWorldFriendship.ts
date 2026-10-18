import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { FriendshipNamecard } from "#src/models/friendship/FriendshipNamecard";

import { readFriendshipLevels } from "#src/services/friendship/readFriendshipLevels";
import { readFriendshipNamecards } from "#src/services/friendship/readFriendshipNamecards";
import { getResultAsync } from "@esposter/shared";
import { shallowRef } from "vue";

// The Friendship levels and the namecards each character's Friendship opens, read from the hosted game data as the world starts
export const useWorldFriendship = (gameDataBaseUrl: string) => {
  const friendshipLevels = shallowRef<FriendshipLevel[]>([]);
  const friendshipNamecards = shallowRef<FriendshipNamecard[]>([]);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readFriendshipLevels(gameDataBaseUrl)).match(
    (levels) => {
      friendshipLevels.value = levels;
    },
    (error) => {
      console.error(error);
    },
  );
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readFriendshipNamecards(gameDataBaseUrl)).match(
    (namecards) => {
      friendshipNamecards.value = namecards;
    },
    (error) => {
      console.error(error);
    },
  );
  return { friendshipLevels, friendshipNamecards };
};
