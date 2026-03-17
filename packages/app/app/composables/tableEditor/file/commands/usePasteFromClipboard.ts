import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { parseClipboardRows } from "@/services/tableEditor/file/commands/parseClipboardRows";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";

export const usePasteFromClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const createRows = useCreateRows();
  return async () => {
    if (!editedItem.value?.dataSource) return;
    try {
      const text = await navigator.clipboard.readText();
      const rows = parseClipboardRows(text, editedItem.value.dataSource, editedItem.value);
      createRows(rows);
    } catch (error) {
      createAlert(error instanceof Error ? error.message : "Failed to paste from clipboard", "error");
    }
  };
};
