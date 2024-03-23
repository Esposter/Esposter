import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { Game } from "@/models/dungeons/data/Game";
import { Save } from "@/models/dungeons/data/Save";
import type { Controls } from "@/models/dungeons/input/Controls";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { dayjs } from "@/services/dayjs";
import { DUNGEONS_LOCAL_STORAGE_KEY } from "@/services/dungeons/constants";
import { Cameras } from "phaser";

export const useGameStore = defineStore("dungeons/game", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const phaserStore = usePhaserStore();
  const { switchToScene } = phaserStore;
  const { scene } = storeToRefs(phaserStore);
  const cameraStore = useCameraStore();
  const { fadeOut } = cameraStore;
  const game = ref(new Game());
  const save = ref(new Save());
  // We can assume that this will always exist because
  // we will create the controls in the preloader scene
  const controls = ref() as Ref<Controls>;
  const saveGame = async () => {
    game.value.saves[0] = save.value;

    if (status.value === "authenticated") {
      game.value.updatedAt = new Date();
      await $client.dungeons.saveGame.mutate(game.value);
    } else if (status.value === "unauthenticated") {
      game.value.updatedAt = new Date();
      localStorage.setItem(DUNGEONS_LOCAL_STORAGE_KEY, game.value.toJSON());
    }
  };
  const fadeSwitchToScene = (sceneKey: SceneKey, msDuration = 500, initializeSceneData?: () => void) => {
    fadeOut(dayjs.duration(msDuration, "milliseconds").asMilliseconds());
    scene.value.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      initializeSceneData?.();
      switchToScene(sceneKey);
    });
  };

  return { game, save, controls, saveGame, fadeSwitchToScene };
});
