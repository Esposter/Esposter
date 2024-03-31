import { useDialogStore } from "@/store/dungeons/dialog";

export const useBattleDialogStore = defineStore("dungeons/battle/dialog", () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage, showMessageNoInputRequired: baseShowMessageNoInputRequired } =
    dialogStore;
  const battleDialogTarget = useBattleDialogTarget();
  const showMessages = (messages: string[], onComplete?: (() => void) | undefined) => {
    updateQueuedMessagesAndShowMessage(
      battleDialogTarget,
      messages.map((text) => ({ text })),
      onComplete,
    );
  };
  const showMessageNoInputRequired = (message: string, onComplete?: () => void) => {
    baseShowMessageNoInputRequired(battleDialogTarget, { text: message }, onComplete);
  };
  return { showMessages, showMessageNoInputRequired };
});
