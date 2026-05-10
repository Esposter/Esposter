import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { PasteRangeCommand } from "@/models/tableEditor/file/commands/PasteRangeCommand";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { parseClipboardValuesByPosition } from "@/services/tableEditor/file/commands/parseClipboardValuesByPosition";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { useColumnStore } from "@/store/tableEditor/file/column";
import { useCellStore } from "@/store/tableEditor/file/cell";
import { getResultAsync, noop, takeOne, toRawDeep } from "@esposter/shared";

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
  return async (insertMode = false) => {
    if (!editedItem.value?.dataSource) return;
    await getResultAsync(async () => {
      const text = await window.navigator.clipboard.readText();
      const pastedValues = parseClipboardValuesByPosition(text);
      if (pastedValues.length === 0) return;
      const dataSource = editedItem.value!.dataSource!;
      const anchorRowIndex = selectedCellRange.value?.rowStart ?? dataSource.rows.length;
      const anchorColumnIndex = selectedCellRange.value?.columnStart ?? 0;
      const targetColumnNames = displayColumns.value.map((column) => column.name);
      if (insertMode) {
        const rows = pastedValues.map((pastedRow) => {
          const row = new Row({ data: Object.fromEntries(dataSource.columns.map((c) => [c.name, null])) });
          for (let columnOffset = 0; columnOffset < pastedRow.length; columnOffset++) {
            const columnIndex = anchorColumnIndex + columnOffset;
            if (columnIndex >= displayColumns.value.length) break;
            const column = takeOne(displayColumns.value, columnIndex);
            row.data[column.name] = coerceValue(takeOne(pastedRow, columnOffset), column.type);
          }
          return row;
        });
        createRows(rows, anchorRowIndex);
      } else {
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
        command.execute(editedItem.value!);
        push(command);
      }
    }).match(noop, (error) => {
      createAlert(error.message, "error");
    });
  };
};
