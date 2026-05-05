import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { copyToClipboard } from "@/services/tableEditor/file/commands/copyToClipboard";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";
import { getResultAsync, noop } from "@esposter/shared";

export const useCopyToClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async (rowIds?: string[]) => {
    const dataSource = editedItem.value?.dataSource;
    if (!dataSource) return;
    await getResultAsync(() => copyToClipboard(dataSource, rowIds)).match(noop, (error) => {
      createAlert(error.message, "error");
    });
  };
};
