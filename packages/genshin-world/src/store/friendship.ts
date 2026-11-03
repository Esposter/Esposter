import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { FriendshipNamecard } from "#src/models/friendship/FriendshipNamecard";

import { readFriendshipLevels } from "#src/services/friendship/readFriendshipLevels";
import { readFriendshipNamecards } from "#src/services/friendship/readFriendshipNamecards";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { defineStore } from "pinia";
import { shallowRef } from "vue";

// The Friendship levels and the namecards each character's Friendship opens, read from the hosted game data as the world
// Starts. A load that fails is logged and left off. The session starts it and stops it as it unmounts
export const useWorldFriendshipStore = defineStore("world/friendship", () => {
  const worldSessionStore = useWorldSessionStore();
  // The Friendship Levels a claim's Companionship EXP is kept under, read from the friendship record. A claim waits while
  // They are unread, since the EXP has no top to stop at without them
  const friendshipLevels = shallowRef<FriendshipLevels>();
  const friendshipNamecards = shallowRef<FriendshipNamecard[]>([]);
  const start = () => {
    getSynchronizedFunction(() =>
      getResultAsync(() => readFriendshipLevels(worldSessionStore.gameDataBaseUrl)).match(
        (levels) => {
          friendshipLevels.value = levels;
        },
        (error) => {
          console.error(error);
        },
      ),
    )();
    getSynchronizedFunction(() =>
      getResultAsync(() => readFriendshipNamecards(worldSessionStore.gameDataBaseUrl)).match(
        (namecards) => {
          friendshipNamecards.value = namecards;
        },
        (error) => {
          console.error(error);
        },
      ),
    )();
  };
  const stop = () => {
    friendshipLevels.value = undefined;
    friendshipNamecards.value = [];
  };

  return { friendshipLevels, friendshipNamecards, start, stop };
});
