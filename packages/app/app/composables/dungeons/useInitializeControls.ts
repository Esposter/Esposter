import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { JoystickControls } from "@/models/dungeons/input/JoystickControls";
import { KeyboardControls } from "@/models/dungeons/input/KeyboardControls";
import { useControlsStore } from "@/store/dungeons/controls";
import isMobile from "is-mobile";
import { usePhaserStore } from "vue-phaserjs";

export const useInitializeControls = (scene: SceneWithPlugins) => {
  const phaserStore = usePhaserStore();
  const { launchParallelScene } = phaserStore;
  const controlsStore = useControlsStore();
  const { controls } = storeToRefs(controlsStore);

  if (isMobile()) {
    controls.value = new JoystickControls();
    launchParallelScene(scene, SceneKey.MobileJoystick);
  } else controls.value = new KeyboardControls(scene);
};
