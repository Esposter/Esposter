import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { PasteMode } from "@/models/resource/sheet/commands/PasteMode";
import { createPastedRowData } from "@/services/resource/sheet/commands/createPastedRowData";
import { parseClipboardValuesByPosition } from "@/services/resource/sheet/commands/parseClipboardValuesByPosition";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useSheetStore } from "@/store/resource/sheet";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useColumnStore } from "@/store/resource/sheet/column";
import { exhaustiveGuard, getResultAsync, noop } from "@esposter/shared";

export const usePasteRangeFromClipboard = () => {
  const sheetStore = useSheetStore();
  const { dataSource } = storeToRefs(sheetStore);
  const columnStore = useColumnStore();
  const { displayColumns } = storeToRefs(columnStore);
  const cellStore = useCellStore();
  const { selectedCellRange } = storeToRefs(cellStore);
  const createRows = useCreateRows();
  const pasteRange = usePasteRange();
  return async (pasteMode = PasteMode.Overwrite) => {
    const dataSourceValue = dataSource.value;
    await getResultAsync(async () => {
      const text = await window.navigator.clipboard.readText();
      const pastedValues = parseClipboardValuesByPosition(text);
      if (pastedValues.length === 0) return;
      const anchorRowIndex = selectedCellRange.value?.rowStart ?? dataSourceValue.rows.length;
      const anchorColumnIndex = selectedCellRange.value?.columnStart ?? 0;
      const targetColumnNames = displayColumns.value.map((column) => column.name);
      switch (pasteMode) {
        case PasteMode.Overwrite: {
          await pasteRange(anchorRowIndex, anchorColumnIndex, pastedValues, targetColumnNames);
          break;
        }
        case PasteMode.ShiftDown: {
          const targetColumns = displayColumns.value.slice(anchorColumnIndex);
          const rows = pastedValues.map(
            (pastedRow) => new Row({ data: createPastedRowData(dataSourceValue.columns, targetColumns, pastedRow) }),
          );
          await createRows(rows, anchorRowIndex);
          break;
        }
        default:
          exhaustiveGuard(pasteMode);
      }
    }).match(noop, createErrorAlert);
  };
};
