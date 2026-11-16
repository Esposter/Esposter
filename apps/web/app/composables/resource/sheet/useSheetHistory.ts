import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { useSheetStore } from "#src/store/resource/sheet/index";

// Undo and redo the sheet and save what they leave, for the toolbar's buttons and the shortcuts alike
export const useSheetHistory = () => {
  const sheetStore = useSheetStore();
  const { saveSheet } = sheetStore;
  const { dataSource } = storeToRefs(sheetStore);
  const sheetHistoryStore = useSheetHistoryStore();
  const { redo, undo } = sheetHistoryStore;
  const { isRedoable, isUndoable } = storeToRefs(sheetHistoryStore);
  const redoSheet = () => {
    if (!isRedoable.value) return;
    redo(dataSource.value);
    saveSheet();
  };
  const undoSheet = () => {
    if (!isUndoable.value) return;
    undo(dataSource.value);
    saveSheet();
  };
  return { redoSheet, undoSheet };
};
