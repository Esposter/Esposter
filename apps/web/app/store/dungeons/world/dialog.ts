import type { DialogMessage } from "#src/models/dungeons/UI/dialog/DialogMessage";
import type { SceneWithPlugins } from "vue-phaserjs";

import { DialogTarget } from "#src/models/dungeons/UI/dialog/DialogTarget";
import { DIALOG_WIDTH } from "#src/services/dungeons/scene/world/constants";
import { useDialogStore } from "#src/store/dungeons/dialog";

export const useWorldDialogStore = defineStore("dungeons/world/dialog", () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const isDialogVisible = ref(false);
  const { dialogMessage } = useDialogMessage();
  const showMessages = async (scene: SceneWithPlugins, messages: DialogMessage[]) => {
    await updateQueuedMessagesAndShowMessage(
      scene,
      new DialogTarget({ inputPromptCursorX: DIALOG_WIDTH - 16, message: dialogMessage }),
      messages,
    );
    isDialogVisible.value = false;
  };
  return { dialogMessage, isDialogVisible, showMessages };
});
