import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { OnComplete } from "@/models/shared/OnComplete";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useBattleDialogStore = defineStore("dungeons/battle/dialog", () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage, showMessageNoInputRequired: baseShowMessageNoInputRequired } =
    dialogStore;
  const battleDialogTarget = useBattleDialogTarget();
  const showMessages = async (scene: SceneWithPlugins, messages: string[], onComplete?: OnComplete) => {
    await updateQueuedMessagesAndShowMessage(
      scene,
      battleDialogTarget,
      messages.map((text) => ({ text })),
      onComplete,
    );
  };
  const showMessageNoInputRequired = async (scene: SceneWithPlugins, message: string, onComplete?: OnComplete) => {
    await baseShowMessageNoInputRequired(scene, battleDialogTarget, { text: message }, onComplete);
  };
  return { showMessages, showMessageNoInputRequired };
});
