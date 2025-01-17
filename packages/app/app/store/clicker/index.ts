import { ClickerGame } from "#shared/models/clicker/data/ClickerGame";
import { authClient } from "@/services/auth/authClient";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";

export const useClickerStore = defineStore("clicker", () => {
  const { $client } = useNuxtApp();
  const game = ref(new ClickerGame());
  const saveGame = async () => {
    const session = authClient.useSession();

    if (session.value.data) {
      saveItemMetadata(game.value);
      await $client.clicker.saveGame.mutate(game.value);
    } else {
      saveItemMetadata(game.value);
      localStorage.setItem(CLICKER_LOCAL_STORAGE_KEY, game.value.toJSON());
    }
  };
  return { game, saveGame };
});
