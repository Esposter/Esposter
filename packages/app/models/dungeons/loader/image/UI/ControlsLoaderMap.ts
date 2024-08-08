import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Loader } from "phaser";

import base from "@/assets/dungeons/UI/joystick/base.png";
import thumb from "@/assets/dungeons/UI/joystick/thumb.png";
import { ControlsKey } from "@/models/dungeons/keys/image/UI/ControlsKey";

export const ControlsLoaderMap = {
  [ControlsKey.Base]: (scene) => scene.load.image(ControlsKey.Base, base),
  [ControlsKey.Thumb]: (scene) => scene.load.image(ControlsKey.Thumb, thumb),
} as const satisfies Record<ControlsKey, (scene: SceneWithPlugins) => Loader.LoaderPlugin>;
