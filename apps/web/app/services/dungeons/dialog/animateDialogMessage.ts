import type { DialogMessage } from "#src/models/dungeons/UI/dialog/DialogMessage";
import type { DialogTarget } from "#src/models/dungeons/UI/dialog/DialogTarget";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneEventKey } from "#src/models/dungeons/scene/SceneEventKey";
import { getDialogTargetText } from "#src/services/dungeons/dialog/getDialogTargetText";
import { animateText } from "#src/services/dungeons/text/animateText";
import { getSceneEventKey } from "#src/services/phaser/getSceneEventKey";
import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";

// Shows a message's title and types its text into the dialog, the sequence every message shows whether or not the player
// Confirms it
export const animateDialogMessage = (scene: SceneWithPlugins, target: DialogTarget, message: DialogMessage) => {
  // Signal other components that we're ready to show our message.
  phaserEventEmitter.emit(getSceneEventKey(SceneEventKey.ShowMessage, scene.scene.key));

  target.message.value.title = message.title;
  return animateText(scene, getDialogTargetText(target), message.text);
};
