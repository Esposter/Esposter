import { copyToClipboard } from "@/services/resource/sheet/commands/copyToClipboard";
import { filterDataSourceColumns } from "@/services/resource/sheet/dataSource/filterDataSourceColumns";
import { useAlertStore } from "@/store/alert";
import { useSheetStore } from "@/store/resource/sheet";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useRowStore } from "@/store/resource/sheet/row";
import { getResultAsync, noop } from "@esposter/shared";

export const useCopyRangeToClipboard = () => {
  const sheetStore = useSheetStore();
  const { dataSource } = storeToRefs(sheetStore);
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

    // Materialize through the shared export path so computed columns copy their displayed value
    // Instead of an empty cell; the row range bounds the clone/compute work to the selection while
    // FilterDataSourceColumns still resolves each cell via computeValue against the full row/column context.
    const rangeColumnIds = displayColumns.value
      .slice(range.columnStart, range.columnEnd + 1)
      .map((column) => column.id);
    const { columns, rows } = filterDataSourceColumns(displayColumns.value, filteredRows.value, rangeColumnIds, {
      end: range.rowEnd,
      start: range.rowStart,
    });
    const rangeDataSource = {
      ...dataSource.value,
      columns,
      rows,
    };
    await getResultAsync(() => copyToClipboard(rangeDataSource, { includeHeaders: copyIncludesHeaders.value })).match(
      noop,
      (error) => {
        createAlert(error.message, "error");
      },
    );
  };
};
