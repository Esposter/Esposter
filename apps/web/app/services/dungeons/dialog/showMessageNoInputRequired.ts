import type { DialogMessage } from "#src/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "#src/models/dungeons/UI/dialog/DialogTarget";
import type { SceneWithPlugins } from "vue-phaserjs";

import { animateDialogMessage } from "#src/services/dungeons/dialog/animateDialogMessage";

export const showMessageNoInputRequired = (scene: SceneWithPlugins, target: DialogTarget, message: DialogMessage) => {
  target.reset();
  return animateDialogMessage(scene, target, message);
};
