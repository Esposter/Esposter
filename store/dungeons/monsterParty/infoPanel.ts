import { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useInfoPanelStore = defineStore("dungeons/monsterParty/infoPanel", () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const { inputPromptCursorDisplayWidth } = storeToRefs(dialogStore);
  const { infoDialogMessage, infoTextDisplayWidth } = useDialogMessage("info");
  const inputPromptCursorX = computed(
    () => (infoTextDisplayWidth.value ?? 0) + (inputPromptCursorDisplayWidth.value ?? 0) * 2.7,
  );
  const showMessages = (scene: SceneWithPlugins, messages: string[], onComplete?: () => void) => {
    updateQueuedMessagesAndShowMessage(
      scene,
      new DialogTarget({ message: infoDialogMessage, inputPromptCursorX }),
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
