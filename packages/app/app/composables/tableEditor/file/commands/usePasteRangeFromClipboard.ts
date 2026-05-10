import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { PasteMode } from "@/models/tableEditor/file/commands/PasteMode";
import { PasteRangeCommand } from "@/models/tableEditor/file/commands/PasteRangeCommand";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { parseClipboardValuesByPosition } from "@/services/tableEditor/file/commands/parseClipboardValuesByPosition";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";
import { useCellStore } from "@/store/tableEditor/file/cell";
import { useColumnStore } from "@/store/tableEditor/file/column";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { exhaustiveGuard, getResultAsync, noop, takeOne, toRawDeep } from "@esposter/shared";

export const usePasteRangeFromClipboard = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
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
    const editedItemValue = editedItem.value;
    const dataSource = editedItemValue?.dataSource;
    if (!dataSource) return;
    await getResultAsync(async () => {
      const text = await window.navigator.clipboard.readText();
      const pastedValues = parseClipboardValuesByPosition(text);
      if (pastedValues.length === 0) return;
      const anchorRowIndex = selectedCellRange.value?.rowStart ?? dataSource.rows.length;
      const anchorColumnIndex = selectedCellRange.value?.columnStart ?? 0;
      const targetColumnNames = displayColumns.value.map((column) => column.name);
      switch (pasteMode) {
        case PasteMode.Overwrite: {
          const originalRows = dataSource.rows
            .slice(anchorRowIndex, anchorRowIndex + pastedValues.length)
            .map((row) => structuredClone(toRawDeep(row)));
          const command = new PasteRangeCommand(
            anchorRowIndex,
            anchorColumnIndex,
            pastedValues,
            targetColumnNames,
            originalRows,
          );
          command.execute(editedItemValue);
          push(command);
          break;
        }
        case PasteMode.ShiftDown: {
          const rows = pastedValues.map((pastedRow) => {
            const row = new Row({ data: Object.fromEntries(dataSource.columns.map((c) => [c.name, null])) });
            for (const [columnOffset, pastedValue] of pastedRow.entries()) {
              const columnIndex = anchorColumnIndex + columnOffset;
              if (columnIndex >= displayColumns.value.length) break;
              const column = takeOne(displayColumns.value, columnIndex);
              row.data[column.name] = coerceValue(pastedValue, column.type);
            }
            return row;
          });
          createRows(rows, anchorRowIndex);
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
