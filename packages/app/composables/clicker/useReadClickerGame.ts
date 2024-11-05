import type { RecursiveDeepOmitItemMetadata } from "@/util/types/RecursiveDeepOmitItemMetadata";

import { Game } from "@/models/clicker/data/Game";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { omitDeepItemMetadata } from "@/services/shared/omitDeepItemMetadata";
import { useClickerStore } from "@/store/clicker";
import { jsonDateParse } from "@/util/time/jsonDateParse";
import deepEqual from "fast-deep-equal";

export const useReadClickerGame = async () => {
  const { $client } = useNuxtApp();
  const clickerStore = useClickerStore();
  const { saveGame } = clickerStore;
  const { game } = storeToRefs(clickerStore);
  // This is used for tracking when we should save the game
  // i.e. every time the user manually updates the game state
  // which is everything excluding automatic updates like noPoints
  const gameChangedTracker = computed<RecursiveDeepOmitItemMetadata<Game, ["noPoints", "producedValue"]>>(
    (oldGameChangedTracker) => {
      const newGameChangedTracker = omitDeepItemMetadata(game.value, "noPoints", "producedValue");
      return oldGameChangedTracker && deepEqual(newGameChangedTracker, oldGameChangedTracker)
        ? oldGameChangedTracker
        : newGameChangedTracker;
    },
  );

  await useReadData(
    () => {
      const clickerStoreJson = localStorage.getItem(CLICKER_LOCAL_STORAGE_KEY);
      if (clickerStoreJson) game.value = Object.assign(new Game(), jsonDateParse(clickerStoreJson));
      else game.value = new Game();
    },
    async () => {
      game.value = await $client.clicker.readGame.query();
    },
  );

  watchTracker(gameChangedTracker, async () => {
    await saveGame();
  });
};
