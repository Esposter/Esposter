import type { SceneWithPlugins } from "vue-phaserjs";

import { useDialogStore } from "@/store/dungeons/dialog";

export const useBattleDialogStore = defineStore("dungeons/battle/dialog", () => {
  const dialogStore = useDialogStore();
  const { showMessageNoInputRequired: baseShowMessageNoInputRequired, updateQueuedMessagesAndShowMessage } =
    dialogStore;
  const battleDialogTarget = useBattleDialogTarget();
  const showMessages = async (scene: SceneWithPlugins, messages: string[]) =>
    updateQueuedMessagesAndShowMessage(
      scene,
      battleDialogTarget,
      messages.map((text) => ({ text })),
    );
  const showMessageNoInputRequired = async (scene: SceneWithPlugins, message: string) =>
    baseShowMessageNoInputRequired(scene, battleDialogTarget, { text: message });
  return { showMessageNoInputRequired, showMessages };
});
