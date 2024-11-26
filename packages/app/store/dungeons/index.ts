import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Game } from "@/models/dungeons/data/Game";
import { Save } from "@/models/dungeons/data/Save";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";
import { dayjs } from "@/shared/services/dayjs";
import { Cameras } from "phaser";
import { useCameraStore, usePhaserStore } from "vue-phaserjs";

export const useDungeonsStore = defineStore("dungeons", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const phaserStore = usePhaserStore();
  const { switchToScene } = phaserStore;
  const cameraStore = useCameraStore();
  const { fadeOut } = cameraStore;

  const game = ref(new Game());
  const saveGame = async () => {
    if (status.value === "authenticated") {
      saveItemMetadata(game.value);
      await $client.dungeons.saveGame.mutate(game.value);
    } else if (status.value === "unauthenticated") {
      saveItemMetadata(game.value);
      localStorage.setItem(DUNGEONS_LOCAL_STORAGE_KEY, game.value.toJSON());
    }
  };

  const save = ref(new Save());
  const saveIndex = ref(0);
  const saveData = async () => {
    game.value.saves[saveIndex.value] = save.value;
    await saveGame();
  };

  const fadeSwitchToScene = (scene: SceneWithPlugins, sceneKey: SceneKey, msDuration = 1000) => {
    fadeOut(scene, dayjs.duration(msDuration, "milliseconds").asMilliseconds());
    scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, async () => {
      await switchToScene(sceneKey);
    });
  };

  return { fadeSwitchToScene, game, save, saveData, saveGame };
});
