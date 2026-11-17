import type { SceneWithPlugins } from "vue-phaserjs";

import { JoystickControls } from "#src/models/dungeons/input/JoystickControls";
import { KeyboardControls } from "#src/models/dungeons/input/KeyboardControls";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { useControlsStore } from "#src/store/dungeons/controls";
import { checkIsMobile } from "#src/util/device/checkIsMobile";
import { usePhaserStore } from "vue-phaserjs";

export const initializeControls = (scene: SceneWithPlugins) => {
  const phaserStore = usePhaserStore();
  const { launchParallelScene } = phaserStore;
  const controlsStore = useControlsStore();
  const { controls } = storeToRefs(controlsStore);

  if (checkIsMobile()) {
    controls.value = markRaw(new JoystickControls());
    launchParallelScene(scene, SceneKey.MobileJoystick);
  } else controls.value = markRaw(new KeyboardControls(scene));
};
