import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import type { SceneWithPlugins } from "vue-phaserjs";

import { animateDialogMessage } from "@/services/dungeons/dialog/animateDialogMessage";

export const showMessageNoInputRequired = (scene: SceneWithPlugins, target: DialogTarget, message: DialogMessage) => {
  target.reset();
  return animateDialogMessage(scene, target, message);
};
