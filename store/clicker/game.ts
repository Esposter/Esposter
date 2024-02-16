import { Game } from "@/models/clicker/Game";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";

export const useGameStore = defineStore("clicker/game", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const game = ref(new Game());
  const saveGame = async () => {
    if (status.value === "authenticated") {
      game.value.updatedAt = new Date();
      await $client.clicker.saveGame.mutate(game.value);
    } else if (status.value === "unauthenticated") {
      game.value.updatedAt = new Date();
      localStorage.setItem(CLICKER_LOCAL_STORAGE_KEY, game.value.toJSON());
    }
  };
  return { game, saveGame };
});
