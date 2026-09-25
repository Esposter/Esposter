import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { useSheetStore } from "@/store/resource/sheet";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
// Imports replace the whole data section wholesale, so the command history no longer applies.
// An import awaits before it writes — a revision, a dataset read — so the setter is taken where the import starts and
// Writes only the sheet it was started on: taken when it lands, it would replace whichever sheet is open by then
export const useSetDataSource = () => {
  const sheetStore = useSheetStore();
  const { sheetResource } = storeToRefs(sheetStore);
  const { getContentWriter, saveSheet } = sheetStore;
  const sheetHistoryStore = useSheetHistoryStore();
  const { clear } = sheetHistoryStore;
  return () => {
    const writeContent = getContentWriter();
    return async (value: DataSource) => {
      if (!writeContent({ ...sheetResource.value, data: value })) return;
      clear();
      await saveSheet();
    };
  };
};
