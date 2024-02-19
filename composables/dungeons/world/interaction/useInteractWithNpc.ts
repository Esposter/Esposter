import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { getOppositeDirection } from "@/services/dungeons/getOppositeDirection";
import { DIALOG_WIDTH } from "@/services/dungeons/world/constants";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useInteractWithNpc = (): boolean => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const worldSceneStore = useWorldSceneStore();
  const { isDialogVisible, dialogText } = storeToRefs(worldSceneStore);
  const playerStore = usePlayerStore();
  const { direction } = storeToRefs(playerStore);
  const npcStore = useNpcStore();
  const { npcList } = storeToRefs(npcStore);
  const interactiveObject = useFindInteractiveObject(
    npcList.value.map(({ position, ...rest }) => ({ ...position, ...rest })),
  );
  if (!interactiveObject) return false;

  scene.value.gridEngine.turnTowards(interactiveObject.id, getOppositeDirection(direction.value));
  updateQueuedMessagesAndShowMessage(
    { text: dialogText, inputPromptCursorX: DIALOG_WIDTH - 16 },
    [...interactiveObject.messages],
    () => {
      isDialogVisible.value = false;
    },
  );
  return true;
};
