import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useAnimateText } from "@/composables/dungeons/text/useAnimateText";
import { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import { getDialogTargetText } from "@/services/dungeons/dialog/getDialogTargetText";
import { phaserEventEmitter } from "@/services/phaser/phaserEventEmitter";

// Shows a message's title and types its text into the dialog, the sequence every message shows whether or not the player
// Confirms it
export const animateDialogMessage = (scene: SceneWithPlugins, target: DialogTarget, message: DialogMessage) => {
  // Signal other components that we're ready to show our message.
  phaserEventEmitter.emit(`${SceneEventKey.ShowMessage}${scene.scene.key}`);

  target.message.value.title = message.title;
  return useAnimateText(scene, getDialogTargetText(target), message.text);
};
