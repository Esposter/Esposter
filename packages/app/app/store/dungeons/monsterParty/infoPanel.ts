import type { SceneWithPlugins } from "vue-phaserjs";

import { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useInfoPanelStore = defineStore("dungeons/monsterParty/infoPanel", () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const { infoDialogMessage, infoTextDisplayWidth } = useDialogMessage("info");
  const inputPromptCursorX = computed(
    () => (infoTextDisplayWidth.value ?? 0) + (dialogStore.inputPromptCursorDisplayWidth ?? 0) * 2.7,
  );
  const showMessages = (scene: SceneWithPlugins, messages: string[]) =>
    updateQueuedMessagesAndShowMessage(
      scene,
      new DialogTarget({ inputPromptCursorX, message: infoDialogMessage }),
      messages.map((text) => ({ text })),
    );
  return {
    infoDialogMessage,
    infoTextDisplayWidth,
    showMessages,
  };
});
