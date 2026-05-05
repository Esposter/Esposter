import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { getResultAsync } from "@esposter/shared";
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
    await getResultAsync(() => copyToClipboard(editedItem.value.dataSource, rowIds)).match(
      () => undefined,
      (error) => {
        createAlert(error.message, "error");
      },
    );
  };
};
