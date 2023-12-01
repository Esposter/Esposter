import { Game } from "@/models/dungeons/Game";
import { DUNGEONS_STORE } from "@/services/dungeons/constants";
import { useGameStore } from "@/store/dungeons/game";
import { jsonDateParse } from "@/util/json";

export const useReadDungeonsGame = async () => {
  const { $client } = useNuxtApp();
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);

  await useReadData(
    () => {
      const dungeonsStoreJson = localStorage.getItem(DUNGEONS_STORE);
      if (dungeonsStoreJson) game.value = new Game(jsonDateParse(dungeonsStoreJson));
      else game.value = new Game();
    },
    async () => {
      game.value = await $client.dungeons.readGame.query();
    },
  );
};
