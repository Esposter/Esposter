import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { DialogMessage } from "@/models/dungeons/UI/dialog/DialogMessage";
import { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import { DIALOG_WIDTH } from "@/services/dungeons/world/constants";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useWorldDialogStore = defineStore("dungeons/world/dialog", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const isDialogVisible = ref(false);
  const { dialogMessage } = useDialogMessage();
  const showMessages = (messages: DialogMessage[]) => {
    updateQueuedMessagesAndShowMessage(
      scene.value,
      new DialogTarget({ message: dialogMessage, inputPromptCursorX: DIALOG_WIDTH - 16 }),
      messages,
      () => {
        isDialogVisible.value = false;
      },
    );
  };
  return { isDialogVisible, dialogMessage, showMessages };
});
