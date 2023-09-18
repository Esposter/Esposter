import { Game } from "@/models/clicker/Game";
import { CLICKER_STORE } from "@/services/clicker/constants";
import { useGameStore } from "@/store/clicker/game";
import { jsonDateParse } from "@/util/json";

export const useReadGame = async () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);

  if (status.value === "authenticated") {
    game.value = await $client.clicker.readGame.query();
    return;
  }

  onMounted(() => {
    const clickerStoreJson = localStorage.getItem(CLICKER_STORE);
    if (clickerStoreJson) game.value = new Game(jsonDateParse(clickerStoreJson));
  });
};
