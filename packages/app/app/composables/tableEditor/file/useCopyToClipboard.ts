import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { copyToClipboard } from "@/services/tableEditor/file/commands/copyToClipboard";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";

export const useCopyToClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async (rowIds?: string[]) => {
    if (!editedItem.value?.dataSource) return;
    try {
      await copyToClipboard(editedItem.value.dataSource, rowIds);
    } catch (error) {
      createAlert(error instanceof Error ? error.message : "Failed to copy to clipboard", "error");
    }
  };
};
