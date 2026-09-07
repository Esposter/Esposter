import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ControlsKey } from "#shared/models/dungeons/keys/image/UI/ControlsKey";
import base from "@/assets/dungeons/UI/joystick/base.png";
import thumb from "@/assets/dungeons/UI/joystick/thumb.png";

export const ControlsLoaderMap = {
  [ControlsKey.Base]: (scene) => scene.load.image(ControlsKey.Base, base),
  [ControlsKey.Thumb]: (scene) => scene.load.image(ControlsKey.Thumb, thumb),
} as const satisfies Record<ControlsKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
