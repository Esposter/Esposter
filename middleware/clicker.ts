import { Game } from "@/models/clicker/Game";
import { CLICKER_STORE } from "@/services/clicker/constants";
import { useGameStore } from "@/store/clicker/game";
import { jsonDateParse } from "@/utils/json";

export default defineNuxtRouteMiddleware(async () => {
  if (isServer()) return;

  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);

  if (status.value === "authenticated") {
    game.value = await $client.clicker.readGame.query();
    return;
  }

  const clickerStoreJson = localStorage.getItem(CLICKER_STORE);
  game.value = clickerStoreJson ? jsonDateParse(clickerStoreJson) : new Game();
});
