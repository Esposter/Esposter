import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import type { Controls } from "@/models/dungeons/UI/input/Controls";
import { Game } from "@/models/dungeons/data/Game";
import { Save } from "@/models/dungeons/data/Save";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { dayjs } from "@/services/dayjs";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { Cameras } from "phaser";

export const useGameStore = defineStore("dungeons/game", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const phaserStore = usePhaserStore();
  const { switchToScene, switchToPreviousScene } = phaserStore;
  const { scene } = storeToRefs(phaserStore);
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

  // We can assume that this will always exist because
  // we will create the controls in the preloader scene
  const controls = ref() as Ref<Controls>;
  const fadeSwitchToScene = (sceneKey: SceneKey, msDuration = 500) => {
    fadeOut(dayjs.duration(msDuration, "milliseconds").asMilliseconds());
    scene.value.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      switchToScene(sceneKey);
    });
  };
  const fadeSwitchToPreviousScene = (msDuration = 500) => {
    fadeOut(dayjs.duration(msDuration, "milliseconds").asMilliseconds());
    scene.value.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      switchToPreviousScene();
    });
  };

  return { game, saveGame, save, saveData, controls, fadeSwitchToScene, fadeSwitchToPreviousScene };
});
