import type { AssetLoader } from "#src/models/dungeons/loader/AssetLoader";

import { ControlsKey } from "#shared/models/dungeons/keys/image/UI/ControlsKey";
import base from "#src/assets/dungeons/UI/joystick/base.png";
import thumb from "#src/assets/dungeons/UI/joystick/thumb.png";

export const ControlsLoaderMap = {
  [ControlsKey.Base]: (scene) => scene.load.image(ControlsKey.Base, base),
  [ControlsKey.Thumb]: (scene) => scene.load.image(ControlsKey.Thumb, thumb),
} as const satisfies Record<ControlsKey, AssetLoader>;
