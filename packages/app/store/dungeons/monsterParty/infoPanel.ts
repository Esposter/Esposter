import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { OnComplete } from "@/models/shared/OnComplete";

import { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useInfoPanelStore = defineStore("dungeons/monsterParty/infoPanel", () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const { inputPromptCursorDisplayWidth } = storeToRefs(dialogStore);
  const { infoDialogMessage, infoTextDisplayWidth } = useDialogMessage("info");
  const inputPromptCursorX = computed(
    () => (infoTextDisplayWidth.value ?? 0) + (inputPromptCursorDisplayWidth.value ?? 0) * 2.7,
  );
  const showMessages = async (scene: SceneWithPlugins, messages: string[], onComplete?: OnComplete) => {
    await updateQueuedMessagesAndShowMessage(
      scene,
      new DialogTarget({ inputPromptCursorX, message: infoDialogMessage }),
      messages.map((text) => ({ text })),
      onComplete,
    );
  };
  return {
    infoDialogMessage,
    infoTextDisplayWidth,
    showMessages,
  };
});
