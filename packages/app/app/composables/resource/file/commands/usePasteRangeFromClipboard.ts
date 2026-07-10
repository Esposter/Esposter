import { Row } from "#shared/models/resource/file/datasource/Row";
import { PasteMode } from "@/models/resource/file/commands/PasteMode";
import { PasteRangeCommand } from "@/models/resource/file/commands/PasteRangeCommand";
import { coerceValue } from "@/services/resource/file/column/coerceValue";
import { parseClipboardValuesByPosition } from "@/services/resource/file/commands/parseClipboardValuesByPosition";
import { useAlertStore } from "@/store/alert";
import { useFileStore } from "@/store/resource/file";
import { useCellStore } from "@/store/resource/file/cell";
import { useColumnStore } from "@/store/resource/file/column";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { exhaustiveGuard, getResultAsync, noop, takeOne, toRawDeep } from "@esposter/shared";

export const usePasteRangeFromClipboard = () => {
  const fileStore = useFileStore();
  const { saveFile } = fileStore;
  const { dataSource } = storeToRefs(fileStore);
  const columnStore = useColumnStore();
  const { displayColumns } = storeToRefs(columnStore);
  const cellStore = useCellStore();
  const { selectedCellRange } = storeToRefs(cellStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
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
          await saveFile();
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
