import type { DataSourceItem } from "#shared/models/resource/file/datasource/DataSourceItem";

import { copyToClipboard } from "@/services/resource/file/commands/copyToClipboard";
import { useAlertStore } from "@/store/alert";
import { useFileStore } from "@/store/resource/file";
import { useCellStore } from "@/store/resource/file/cell";
import { useColumnStore } from "@/store/resource/file/column";
import { useRowStore } from "@/store/resource/file/row";
import { getResultAsync, noop } from "@esposter/shared";

export const useCopyRangeToClipboard = () => {
  const fileStore = useFileStore();
  const { dataSource } = storeToRefs(fileStore);
  const columnStore = useColumnStore();
  const { displayColumns } = storeToRefs(columnStore);
  const rowStore = useRowStore();
  const { copyIncludesHeaders, filteredRows } = storeToRefs(rowStore);
  const cellStore = useCellStore();
  const { selectedCellRange } = storeToRefs(cellStore);
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async () => {
    const range = selectedCellRange.value;
    if (!range) return;

    const rangeDataSource = {
      ...dataSource.value,
      columns: displayColumns.value.slice(range.columnStart, range.columnEnd + 1),
      rows: filteredRows.value.slice(range.rowStart, range.rowEnd + 1),
    };
    await getResultAsync(() => copyToClipboard(rangeDataSource, { includeHeaders: copyIncludesHeaders.value })).match(
      noop,
      (error) => {
        createAlert(error.message, "error");
      },
    );
  };
};
