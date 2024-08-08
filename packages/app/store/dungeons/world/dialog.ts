import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import type { OnComplete } from "@/models/shared/OnComplete";

import { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import { DIALOG_WIDTH } from "@/services/dungeons/scene/world/constants";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useWorldDialogStore = defineStore("dungeons/world/dialog", () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const isDialogVisible = ref(false);
  const { dialogMessage } = useDialogMessage();
  const showMessages = async (scene: SceneWithPlugins, messages: DialogMessage[], onComplete?: OnComplete) => {
    await updateQueuedMessagesAndShowMessage(
      scene,
      new DialogTarget({ inputPromptCursorX: DIALOG_WIDTH - 16, message: dialogMessage }),
      messages,
      () => {
        isDialogVisible.value = false;
        onComplete?.();
      },
    );
  };
  return { dialogMessage, isDialogVisible, showMessages };
});
