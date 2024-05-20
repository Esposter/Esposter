import { Game } from "@/models/dungeons/data/Game";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { useGameStore } from "@/store/dungeons/game";
import { jsonDateParse } from "@/util/time/jsonDateParse";

export const useReadDungeonsGame = async () => {
  const { $client } = useNuxtApp();
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  await useReadData(
    () => {
      const dungeonsStoreJson = localStorage.getItem(DUNGEONS_LOCAL_STORAGE_KEY);
      if (dungeonsStoreJson) game.value = new Game(jsonDateParse(dungeonsStoreJson));
      else game.value = new Game();
    },
    async () => {
      game.value = await $client.dungeons.readGame.query();
    },
  );
};
