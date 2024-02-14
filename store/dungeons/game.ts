import { Game } from "@/models/dungeons/Game";
import { type Controls } from "@/models/dungeons/input/Controls";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";

export const useGameStore = defineStore("dungeons/game", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const game = ref(new Game());
  // We can assume that this will always exist because
  // we will create the controls in the preloader scene
  const controls = ref() as Ref<Controls>;
  const joystickY = ref() as Ref<number>;
  const saveGame = async () => {
    if (status.value === "authenticated") {
      game.value.updatedAt = new Date();
      await $client.dungeons.saveGame.mutate(game.value);
    } else if (status.value === "unauthenticated") {
      game.value.updatedAt = new Date();
      localStorage.setItem(DUNGEONS_LOCAL_STORAGE_KEY, game.value.toJSON());
    }
  };
  return { game, controls, joystickY, saveGame };
});
