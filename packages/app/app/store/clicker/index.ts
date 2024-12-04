import { ClickerGame } from "#shared/models/clicker/data/ClickerGame";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";

export const useClickerStore = defineStore("clicker", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const game = ref(new ClickerGame());
  const saveGame = async () => {
    if (status.value === "authenticated") {
      saveItemMetadata(game.value);
      await $client.clicker.saveGame.mutate(game.value);
    } else if (status.value === "unauthenticated") {
      saveItemMetadata(game.value);
      localStorage.setItem(CLICKER_LOCAL_STORAGE_KEY, game.value.toJSON());
    }
  };
  return { game, saveGame };
});
