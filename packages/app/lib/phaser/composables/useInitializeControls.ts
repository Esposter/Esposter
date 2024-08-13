import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

import { JoystickControls } from "@/lib/phaser/models/input/JoystickControls";
import { KeyboardControls } from "@/lib/phaser/models/input/KeyboardControls";
import { usePhaserStore } from "@/lib/phaser/store";
import { useInputStore } from "@/lib/phaser/store/input";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import isMobile from "is-mobile";

export const useInitializeControls = (scene: SceneWithPlugins) => {
  const phaserStore = usePhaserStore();
  const { launchParallelScene } = phaserStore;
  const inputStore = useInputStore();
  const { controls } = storeToRefs(inputStore);

  if (isMobile()) {
    controls.value = new JoystickControls();
    launchParallelScene(scene, SceneKey.MobileJoystick);
  } else controls.value = new KeyboardControls(scene);
};
