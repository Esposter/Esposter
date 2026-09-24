import { useSheetStore } from "@/store/resource/sheet";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";

// Undo and redo the sheet and save what they leave, for the toolbar's buttons and the shortcuts alike
export const useSheetHistory = () => {
  const sheetStore = useSheetStore();
  const { saveSheet } = sheetStore;
  const { dataSource } = storeToRefs(sheetStore);
  const sheetHistoryStore = useSheetHistoryStore();
  const { redo, undo } = sheetHistoryStore;
  const { isRedoable, isUndoable } = storeToRefs(sheetHistoryStore);
  const redoSheet = async () => {
    if (!isRedoable.value) return;
    redo(dataSource.value);
    await saveSheet();
  };
  const undoSheet = async () => {
    if (!isUndoable.value) return;
    undo(dataSource.value);
    await saveSheet();
  };
  return { redoSheet, undoSheet };
};
