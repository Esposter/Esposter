import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useBattleDialogStore = defineStore("dungeons/battle/dialog", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage, showMessageNoInputRequired: baseShowMessageNoInputRequired } =
    dialogStore;
  const battleDialogTarget = useBattleDialogTarget();
  const showMessages = (messages: string[], onComplete?: (() => void) | undefined) => {
    updateQueuedMessagesAndShowMessage(
      scene.value,
      battleDialogTarget,
      messages.map((text) => ({ text })),
      onComplete,
    );
  };
  const showMessageNoInputRequired = (message: string, onComplete?: () => void) => {
    baseShowMessageNoInputRequired(scene.value, battleDialogTarget, { text: message }, onComplete);
  };
  return { showMessages, showMessageNoInputRequired };
});
