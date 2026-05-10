import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { CopyRangeCommand } from "@/models/tableEditor/file/commands/CopyRangeCommand";
import { copyToClipboard } from "@/services/tableEditor/file/commands/copyToClipboard";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";
import { useCellStore } from "@/store/tableEditor/file/cell";
import { useColumnStore } from "@/store/tableEditor/file/column";
import { useRowStore } from "@/store/tableEditor/file/row";
import { getResultAsync, noop } from "@esposter/shared";

export const useCopyRangeToClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const columnStore = useColumnStore();
  const { displayColumns } = storeToRefs(columnStore);
  const rowStore = useRowStore();
  const { copyIncludesHeaders, filteredRows } = storeToRefs(rowStore);
  const cellStore = useCellStore();
  const { selectedCellRange } = storeToRefs(cellStore);
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async () => {
    const dataSource = editedItem.value?.dataSource;
    const range = selectedCellRange.value;
    if (!dataSource || !range) return;

    const copiedRange = new CopyRangeCommand(
      range,
      displayColumns.value,
      filteredRows.value,
      copyIncludesHeaders.value,
    ).execute();
    const rangeDataSource = { ...dataSource, columns: copiedRange.columns, rows: copiedRange.rows };
    await getResultAsync(() => copyToClipboard(rangeDataSource, { includeHeaders: copiedRange.includeHeaders })).match(
      noop,
      (error) => {
        createAlert(error.message, "error");
      },
    );
  };
};
