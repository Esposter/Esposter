import type { DialogTarget } from "@/models/dungeons/DialogTarget";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";
import { useDialogStore } from "@/store/dungeons/dialog";

export const useBattleDialogTarget = (): DialogTarget => {
  const dialogStore = useDialogStore();
  const { inputPromptCursorDisplayWidth } = storeToRefs(dialogStore);
  const infoPanelStore = useInfoPanelStore();
  const { line1Text, line1TextDisplayWidth } = storeToRefs(infoPanelStore);
  const inputPromptCursorX = computed(
    () => (line1TextDisplayWidth.value ?? 0) + (inputPromptCursorDisplayWidth.value ?? 0) * 2.7,
  );
  return { text: line1Text, inputPromptCursorX };
};
