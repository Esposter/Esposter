import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { copyToClipboard } from "@/services/tableEditor/file/commands/copyToClipboard";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";
import { useRowStore } from "@/store/tableEditor/file/row";
import { getResultAsync, noop } from "@esposter/shared";

export const useCopyToClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const rowStore = useRowStore();
  const { copyIncludesHeaders, selectedRowIds } = storeToRefs(rowStore);
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async (rowIds?: string[]) => {
    const dataSource = editedItem.value?.dataSource;
    if (!dataSource) return;
    const effectiveRowIds = rowIds ?? (selectedRowIds.value.length > 0 ? selectedRowIds.value : undefined);
    await getResultAsync(() =>
      copyToClipboard(dataSource, { includeHeaders: copyIncludesHeaders.value, rowIds: effectiveRowIds }),
    ).match(noop, (error) => {
      createAlert(error.message, "error");
    });
  };
};
