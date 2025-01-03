import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "vue-phaserjs";

import { DungeonsGame } from "#shared/models/dungeons/data/DungeonsGame";
import { Save } from "#shared/models/dungeons/data/Save";
import { dayjs } from "#shared/services/dayjs";
import { authClient } from "@/services/auth/authClient";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";
import { Cameras } from "phaser";
import { useCameraStore, usePhaserStore } from "vue-phaserjs";

export const useDungeonsStore = defineStore("dungeons", () => {
  const { $client } = useNuxtApp();
  const phaserStore = usePhaserStore();
  const { switchToScene } = phaserStore;
  const cameraStore = useCameraStore();
  const { fadeOut } = cameraStore;

  const game = ref(new DungeonsGame());
  const saveGame = async () => {
    const { data: session } = await authClient.useSession(useFetch);

    if (session.value) {
      saveItemMetadata(game.value);
      await $client.dungeons.saveGame.mutate(game.value);
    } else {
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
