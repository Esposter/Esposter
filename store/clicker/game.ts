import type { Game } from "@/models/clicker/Game";
import { CLICKER_STORE } from "@/services/clicker/settings";

export const useGameStore = defineStore("clicker/game", () => {
  const { $client } = useNuxtApp();
  const { status } = useSession();
  const game = ref<Game | null>(null);
  const saveGame = async () => {
    if (!game.value) return;

    if (status.value === "authenticated") await $client.clicker.saveGame.mutate(game.value);
    else localStorage.setItem(CLICKER_STORE, JSON.stringify(game.value));
  };
  return { game, saveGame };
});
