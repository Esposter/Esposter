import { Game } from "@/models/clicker/Game";
import { CLICKER_STORE } from "@/services/clicker/constants";
import { useGameStore } from "@/store/clicker/game";
import { isDiff } from "@/util/isDiff";
import { jsonDateParse } from "@/util/json";

export const useReadClickerGame = async () => {
  const { $client } = useNuxtApp();
  const gameStore = useGameStore();
  const { saveGame } = gameStore;
  const { game } = storeToRefs(gameStore);
  // This is used for tracking when we should save the game
  // i.e. every time we update the game state aside from noPoints
  // @TODO: Track boughtBuildings without producedValue after implementing omitDeep
  const gameTracker = computed<Omit<Game, "noPoints">>((oldGameTracker) => {
    const { noPoints, ...rest } = game.value;
    return !oldGameTracker || isDiff(oldGameTracker, rest) ? rest : oldGameTracker;
  });

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

  watch(gameTracker, saveGame);
};
