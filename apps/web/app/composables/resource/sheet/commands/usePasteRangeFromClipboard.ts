import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { PasteMode } from "#src/models/resource/sheet/commands/PasteMode";
import { createPastedRowData } from "#src/services/resource/sheet/commands/createPastedRowData";
import { parseClipboardValuesByPosition } from "#src/services/resource/sheet/commands/parseClipboardValuesByPosition";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useResourceStore } from "#src/store/resource/index";
import { useCellStore } from "#src/store/resource/sheet/cell";
import { useColumnStore } from "#src/store/resource/sheet/column";
import { useSheetStore } from "#src/store/resource/sheet/index";
import { exhaustiveGuard, getResultAsync, noop } from "@esposter/shared";

export const usePasteRangeFromClipboard = () => {
  const resourceStore = useResourceStore();
  const sheetStore = useSheetStore();
  const { dataSource } = storeToRefs(sheetStore);
  const columnStore = useColumnStore();
  const { displayColumns } = storeToRefs(columnStore);
  const cellStore = useCellStore();
  const { selectedCellRange } = storeToRefs(cellStore);
  const createRows = useCreateRows();
  const pasteRange = usePasteRange();
  return async (pasteMode: PasteMode = PasteMode.Overwrite) => {
    // The sheet and its anchor are read before the clipboard await, since a switch during it moves both to another sheet
    const resourceId = resourceStore.currentResourceId;
    const dataSourceValue = dataSource.value;
    const anchorRowIndex = selectedCellRange.value?.rowStart ?? dataSourceValue.rows.length;
    const anchorColumnIndex = selectedCellRange.value?.columnStart ?? 0;
    const targetColumnNames = displayColumns.value.map((column) => column.name);
    await getResultAsync(async () => {
      const text = await window.navigator.clipboard.readText();
      const pastedValues = parseClipboardValuesByPosition(text);
      if (pastedValues.length === 0) return;
      // The paste is for the sheet it was issued on, so a sheet that replaced it during the read takes none of it
      if (resourceStore.currentResourceId !== resourceId) return;
      switch (pasteMode) {
        case PasteMode.Overwrite: {
          pasteRange(anchorRowIndex, anchorColumnIndex, pastedValues, targetColumnNames);
          break;
        }
        case PasteMode.ShiftDown: {
          const targetColumns = displayColumns.value.slice(anchorColumnIndex);
          const rows = pastedValues.map(
            (pastedRow) => new Row({ data: createPastedRowData(dataSourceValue.columns, targetColumns, pastedRow) }),
          );
          createRows(rows, anchorRowIndex);
          break;
        }
        default:
          exhaustiveGuard(pasteMode);
      }
    }).match(noop, createErrorAlert);
  };
};
