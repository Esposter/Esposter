import { Game } from "@/models/clicker/Game";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { useGameStore } from "@/store/clicker/game";
import { jsonDateParse } from "@/util/jsonDateParse";
import { omitDeep } from "@/util/omitDeep";
import type { RecursiveDeepOmit } from "@/util/types/RecursiveDeepOmit";
import deepEqual from "deep-equal";

export const useReadClickerGame = async () => {
  const { $client } = useNuxtApp();
  const gameStore = useGameStore();
  const { saveGame } = gameStore;
  const { game } = storeToRefs(gameStore);
  // This is used for tracking when we should save the game
  // i.e. every time the user manually updates the game state
  // which is everything excluding automatic updates like noPoints
  const gameTracker = computed<RecursiveDeepOmit<Game, ["noPoints", "producedValue"]>>((oldGameTracker) => {
    const newGameTracker = omitDeep(game.value, "noPoints", "producedValue");
    return oldGameTracker && deepEqual(newGameTracker, oldGameTracker) ? oldGameTracker : newGameTracker;
  });

  await useReadData(
    () => {
      const clickerStoreJson = localStorage.getItem(CLICKER_LOCAL_STORAGE_KEY);
      if (clickerStoreJson) game.value = new Game(jsonDateParse(clickerStoreJson));
      else game.value = new Game();
    },
    async () => {
      game.value = await $client.clicker.readGame.query();
    },
  );

  watch(gameTracker, saveGame, { deep: true });
};
