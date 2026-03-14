import type { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { Save } from "#shared/models/dungeons/data/Save";
import { dayjs } from "#shared/services/dayjs";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { Cameras } from "phaser";
import { useCameraStore, usePhaserStore } from "vue-phaserjs";

export const useDungeonsStore = defineStore("dungeons", () => {
  const { $trpc } = useNuxtApp();
  const phaserStore = usePhaserStore();
  const { switchToScene } = phaserStore;
  const cameraStore = useCameraStore();
  const { fadeOut } = cameraStore;

  const dungeons = ref(new Dungeons());
  const saveDungeons = useSave(dungeons, {
    auth: { save: $trpc.dungeons.saveDungeons.mutate },
    unauth: { key: DUNGEONS_LOCAL_STORAGE_KEY, schema: dungeonsSchema },
  });

  const save = ref(new Save());
  const saveIndex = ref(0);
  const saveData = async () => {
    dungeons.value.saves[saveIndex.value] = save.value;
    await saveDungeons();
  };

  const fadeSwitchToScene = (scene: SceneWithPlugins, sceneKey: SceneKey, msDuration = 1000) => {
    fadeOut(scene, dayjs.duration(msDuration, "milliseconds").asMilliseconds());
    scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, async () => {
      await switchToScene(sceneKey);
    });
  };

  return { dungeons, fadeSwitchToScene, save, saveData, saveDungeons };
});
