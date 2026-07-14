import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { PasteMode } from "@/models/resource/sheet/commands/PasteMode";
import { PasteRangeCommand } from "@/models/resource/sheet/commands/PasteRangeCommand";
import { coerceValue } from "@/services/resource/sheet/column/coerceValue";
import { parseClipboardValuesByPosition } from "@/services/resource/sheet/commands/parseClipboardValuesByPosition";
import { useAlertStore } from "@/store/alert";
import { useSheetStore } from "@/store/resource/sheet";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { exhaustiveGuard, getResultAsync, noop, takeOne, toRawDeep } from "@esposter/shared";

export const usePasteRangeFromClipboard = () => {
  const sheetStore = useSheetStore();
  const { saveSheet } = sheetStore;
  const { dataSource } = storeToRefs(sheetStore);
  const columnStore = useColumnStore();
  const { displayColumns } = storeToRefs(columnStore);
  const cellStore = useCellStore();
  const { selectedCellRange } = storeToRefs(cellStore);
  const sheetHistoryStore = useSheetHistoryStore();
  const { push } = sheetHistoryStore;
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const createRows = useCreateRows();
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
          const originalRows = dataSourceValue.rows
            .slice(anchorRowIndex, anchorRowIndex + pastedValues.length)
            .map((row) => structuredClone(toRawDeep(row)));
          const command = new PasteRangeCommand(
            anchorRowIndex,
            anchorColumnIndex,
            pastedValues,
            targetColumnNames,
            originalRows,
          );
          command.execute(dataSourceValue);
          push(command);
          await saveSheet();
          break;
        }
        case PasteMode.ShiftDown: {
          const rows = pastedValues.map((pastedRow) => {
            const row = new Row({ data: Object.fromEntries(dataSourceValue.columns.map((c) => [c.name, null])) });
            for (const [columnOffset, pastedValue] of pastedRow.entries()) {
              const columnIndex = anchorColumnIndex + columnOffset;
              if (columnIndex >= displayColumns.value.length) break;
              const column = takeOne(displayColumns.value, columnIndex);
              row.data[column.name] = coerceValue(pastedValue, column.type);
            }
            return row;
          });
          await createRows(rows, anchorRowIndex);
          break;
        }
        default:
          exhaustiveGuard(pasteMode);
      }
    }).match(noop, (error) => {
      createAlert(error.message, "error");
    });
  };
};
