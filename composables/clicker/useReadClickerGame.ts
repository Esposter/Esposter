import { Game } from "@/models/clicker/Game";
import { CLICKER_STORE } from "@/services/clicker/constants";
import { useGameStore } from "@/store/clicker/game";
import { jsonDateParse } from "@/util/json";

export const useReadClickerGame = async () => {
  const { $client } = useNuxtApp();
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);

  await useReadData(
    () => {
      const clickerStoreJson = localStorage.getItem(CLICKER_STORE);
      if (clickerStoreJson) game.value = new Game(jsonDateParse(clickerStoreJson));
      else game.value = new Game();
    },
    async () => {
      game.value = await $client.clicker.readGame.query();
    },
  );
};
