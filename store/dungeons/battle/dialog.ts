import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useBattleDialogStore = defineStore("dungeons/battle/dialog", () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage, showMessageNoInputRequired: baseShowMessageNoInputRequired } =
    dialogStore;
  const battleDialogTarget = useBattleDialogTarget();
  const showMessages = (scene: SceneWithPlugins, messages: string[], onComplete?: (() => void) | undefined) => {
    updateQueuedMessagesAndShowMessage(
      scene,
      battleDialogTarget,
      messages.map((text) => ({ text })),
      onComplete,
    );
  };
  const showMessageNoInputRequired = (scene: SceneWithPlugins, message: string, onComplete?: () => void) => {
    baseShowMessageNoInputRequired(scene, battleDialogTarget, { text: message }, onComplete);
  };
  return { showMessages, showMessageNoInputRequired };
});
