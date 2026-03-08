import type { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { Save } from "#shared/models/dungeons/data/Save";
import { dayjs } from "#shared/services/dayjs";
import { authClient } from "@/services/auth/authClient";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";
import { Cameras } from "phaser";
import { useCameraStore, usePhaserStore } from "vue-phaserjs";

export const useDungeonsStore = defineStore("dungeons", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const saveToLocalStorage = useSaveToLocalStorage();
  const phaserStore = usePhaserStore();
  const { switchToScene } = phaserStore;
  const cameraStore = useCameraStore();
  const { fadeOut } = cameraStore;

  const dungeons = ref(new Dungeons());
  const saveDungeons = async () => {
    saveItemMetadata(dungeons.value);
    if (session.value.data) await $trpc.dungeons.saveDungeons.mutate(dungeons.value);
    else saveToLocalStorage(DUNGEONS_LOCAL_STORAGE_KEY, dungeonsSchema, dungeons.value);
  };

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
