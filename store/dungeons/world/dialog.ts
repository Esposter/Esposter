import { DIALOG_WIDTH } from "@/services/dungeons/world/constants";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useWorldDialogStore = defineStore("dungeons/world/dialog", () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const worldSceneStore = useWorldSceneStore();
  const { isDialogVisible, dialogText } = storeToRefs(worldSceneStore);
  const showMessages = (messages: string[]) => {
    updateQueuedMessagesAndShowMessage({ text: dialogText, inputPromptCursorX: DIALOG_WIDTH - 16 }, messages, () => {
      isDialogVisible.value = false;
    });
  };
  return { showMessages };
});
