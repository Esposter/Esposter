import type { RecursiveDeepOmitItemMetadata } from "#shared/util/types/RecursiveDeepOmitItemMetadata";

import { ClickerGame } from "#shared/models/clicker/data/ClickerGame";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { omitDeepItemMetadata } from "@/services/shared/omitDeepItemMetadata";
import { useClickerStore } from "@/store/clicker";
import deepEqual from "fast-deep-equal";

export const useReadClickerGame = async () => {
  const { $trpc } = useNuxtApp();
  const clickerStore = useClickerStore();
  const { saveGame } = clickerStore;
  const { game } = storeToRefs(clickerStore);
  // This is used for tracking when we should save the game
  // i.e. every time the user manually updates the game state
  // which is everything excluding automatic updates like noPoints
  const gameChangedTracker = computed<RecursiveDeepOmitItemMetadata<ClickerGame, ["noPoints", "producedValue"]>>(
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
      if (clickerStoreJson) game.value = Object.assign(new ClickerGame(), jsonDateParse(clickerStoreJson));
      else game.value = new ClickerGame();
    },
    async () => {
      game.value = await $trpc.clicker.readGame.query();
    },
  );

  watchTracker(gameChangedTracker, async () => {
    await saveGame();
  });
};
