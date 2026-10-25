import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useAnimateText } from "@/composables/dungeons/text/useAnimateText";
import { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import { getDialogTargetText } from "@/services/dungeons/dialog/getDialogTargetText";
import { phaserEventEmitter } from "@/services/phaser/phaserEventEmitter";

export const showMessageNoInputRequired = (scene: SceneWithPlugins, target: DialogTarget, message: DialogMessage) => {
  target.reset();
  phaserEventEmitter.emit(`${SceneEventKey.ShowMessage}${scene.scene.key}`);

  target.message.value.title = message.title;
  return useAnimateText(scene, getDialogTargetText(target), message.text);
};
