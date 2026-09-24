import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { useSheetStore } from "@/store/resource/sheet";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
// Imports replace the whole data section wholesale, so the command history no longer applies
export const useSetDataSource = () => {
  const sheetStore = useSheetStore();
  const { sheetResource } = storeToRefs(sheetStore);
  const { saveSheet } = sheetStore;
  const sheetHistoryStore = useSheetHistoryStore();
  const { clear } = sheetHistoryStore;
  return async (value: DataSource) => {
    sheetResource.value.data = value;
    clear();
    await saveSheet();
  };
};
