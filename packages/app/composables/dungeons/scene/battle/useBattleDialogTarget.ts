import { DialogTarget } from "@/models/dungeons/UI/dialog/DialogTarget";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useBattleDialogTarget = () => {
  const dialogStore = useDialogStore();
  const { inputPromptCursorDisplayWidth } = storeToRefs(dialogStore);
  const infoPanelStore = useInfoPanelStore();
  const { line1DialogMessage, line1TextDisplayWidth } = storeToRefs(infoPanelStore);
  const inputPromptCursorX = computed(
    () => (line1TextDisplayWidth.value ?? 0) + (inputPromptCursorDisplayWidth.value ?? 0) * 2.7,
  );
  return new DialogTarget({ inputPromptCursorX, message: line1DialogMessage });
};
