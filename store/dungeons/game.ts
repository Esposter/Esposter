import { Game } from "@/models/dungeons/Game";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { type Types } from "phaser";

export const useGameStore = defineStore("dungeons/game", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const game = ref(new Game());
  // We'll assume that cursor keys will always be populated in preloader scene
  const cursorKeys = ref() as Ref<Types.Input.Keyboard.CursorKeys>;
  const saveGame = async () => {
    if (status.value === "authenticated") {
      game.value.updatedAt = new Date();
      await $client.dungeons.saveGame.mutate(game.value);
    } else if (status.value === "unauthenticated") {
      game.value.updatedAt = new Date();
      localStorage.setItem(DUNGEONS_LOCAL_STORAGE_KEY, game.value.toJSON());
    }
  };
  return { game, cursorKeys, saveGame };
});
