import { usePhaserStore } from "@/lib/phaser/store";
import { useCameraStore } from "@/lib/phaser/store/camera";
import { Game } from "@/models/dungeons/data/Game";
import { Save } from "@/models/dungeons/data/Save";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { dayjs } from "@/services/dayjs";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { Cameras } from "phaser";

export const useGameStore = defineStore("dungeons/game", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const phaserStore = usePhaserStore();
  const { switchToScene } = phaserStore;
  const cameraStore = useCameraStore();
  const { fadeOut } = cameraStore;

  const game = ref(new Game());
  const saveGame = async () => {
    if (status.value === "authenticated") {
      game.value.updatedAt = new Date();
      await $client.dungeons.saveGame.mutate(game.value);
    } else if (status.value === "unauthenticated") {
      game.value.updatedAt = new Date();
      localStorage.setItem(DUNGEONS_LOCAL_STORAGE_KEY, game.value.toJSON());
    }
  };

  const save = ref(new Save());
  const saveIndex = ref(0);
  const saveData = async () => {
    game.value.saves[saveIndex.value] = save.value;
    await saveGame();
  };

  const fadeSwitchToScene = (scene: SceneWithPlugins, sceneKey: SceneKey, msDuration = 500) => {
    fadeOut(scene, dayjs.duration(msDuration, "milliseconds").asMilliseconds());
    scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      switchToScene(sceneKey);
    });
  };

  return { game, saveGame, save, saveData, fadeSwitchToScene };
});
