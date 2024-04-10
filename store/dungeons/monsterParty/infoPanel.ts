import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useInfoPanelStore = defineStore("dungeons/monsterParty/infoPanel", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const { infoDialogMessage } = useDialogMessage("info");
  const showMessages = (messages: string[], onComplete?: () => void) => {
    updateQueuedMessagesAndShowMessage(
      scene.value.scene.get<SceneWithPlugins>(SceneKey.MonsterParty),
      new DialogTarget({ message: infoDialogMessage }),
      messages.map((text) => ({ text })),
      onComplete,
    );
  };
  return {
    infoDialogMessage,
    showMessages,
  };
});
