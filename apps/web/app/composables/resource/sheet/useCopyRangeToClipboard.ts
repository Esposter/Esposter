import { copyToClipboard } from "#src/services/resource/sheet/commands/copyToClipboard";
import { filterDataSourceRange } from "#src/services/resource/sheet/dataSource/filterDataSourceRange";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useCellStore } from "#src/store/resource/sheet/cell";
import { useSheetStore } from "#src/store/resource/sheet/index";
import { useRowStore } from "#src/store/resource/sheet/row";
import { getResultAsync, noop } from "@esposter/shared";

export const useCopyRangeToClipboard = () => {
  const sheetStore = useSheetStore();
  const { dataSource } = storeToRefs(sheetStore);
  const rowStore = useRowStore();
  const { displayRows, isCopyIncludingHeaders } = storeToRefs(rowStore);
  const cellStore = useCellStore();
  const { selectedCellRange } = storeToRefs(cellStore);
  return async () => {
    const range = selectedCellRange.value;
    if (!range) return;
    // Materialize through the shared export path so computed columns copy their displayed value
    // Instead of an empty cell; the row range bounds the clone/compute work to the selection while
    // Each cell still resolves against the full row/column context, so a computed column reads its source
    const { columns, rows } = filterDataSourceRange(dataSource.value, displayRows.value, range);
    const rangeDataSource = { ...dataSource.value, columns, rows };
    await getResultAsync(() =>
      copyToClipboard(rangeDataSource, { isIncludingHeaders: isCopyIncludingHeaders.value }),
    ).match(noop, createErrorAlert);
  };
};
