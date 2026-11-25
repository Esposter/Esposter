import type { SceneWithPlugins } from "vue-phaserjs";

import { DialogMessage } from "#src/models/dungeons/UI/dialog/DialogMessage";
import { showMessageNoInputRequired as baseShowMessageNoInputRequired } from "#src/services/dungeons/dialog/showMessageNoInputRequired";
import { useDialogStore } from "#src/store/dungeons/dialog";

export const useBattleDialogStore = defineStore("dungeons/battle/dialog", () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const battleDialogTarget = useBattleDialogTarget();
  const showMessages = (scene: SceneWithPlugins, messages: string[]) =>
    updateQueuedMessagesAndShowMessage(
      scene,
      battleDialogTarget,
      messages.map((text) => new DialogMessage({ text })),
    );
  const showMessageNoInputRequired = (scene: SceneWithPlugins, message: string) =>
    baseShowMessageNoInputRequired(scene, battleDialogTarget, new DialogMessage({ text: message }));
  return { showMessageNoInputRequired, showMessages };
});
