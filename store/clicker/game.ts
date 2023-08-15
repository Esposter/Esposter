import { Game } from "@/models/clicker/Game";
import { CLICKER_STORE } from "@/services/clicker/constants";

export const useGameStore = defineStore("clicker/game", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const game = ref(new Game());
  const saveGame = async () => {
    if (status.value === "authenticated") await $client.clicker.saveGame.mutate(game.value);
    else localStorage.setItem(CLICKER_STORE, JSON.stringify(game.value));
  };
  return { game, saveGame };
});
