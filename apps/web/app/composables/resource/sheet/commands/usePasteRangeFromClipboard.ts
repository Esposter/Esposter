import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { PasteMode } from "#src/models/resource/sheet/commands/PasteMode";
import { createPastedRowData } from "#src/services/resource/sheet/commands/createPastedRowData";
import { readPastedValues } from "#src/services/resource/sheet/commands/readPastedValues";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useResourceStore } from "#src/store/resource/index";
import { useCellStore } from "#src/store/resource/sheet/cell";
import { useColumnStore } from "#src/store/resource/sheet/column";
import { useSheetStore } from "#src/store/resource/sheet/index";
import { exhaustiveGuard, getResultAsync, noop } from "@esposter/shared";

export const usePasteRangeFromClipboard = () => {
  const resourceStore = useResourceStore();
  const { getOpening } = resourceStore;
  const sheetStore = useSheetStore();
  const { dataSource } = storeToRefs(sheetStore);
  const columnStore = useColumnStore();
  const { displayColumns } = storeToRefs(columnStore);
  const cellStore = useCellStore();
  const { selectedCellRange } = storeToRefs(cellStore);
  const createRows = useCreateRows();
  const pasteRange = usePasteRange();
  return async (pasteMode: PasteMode = PasteMode.Overwrite) => {
    // The sheet, its anchor and its opening are read before the clipboard await, since a switch during it moves them to
    // Another sheet, and a close and reopen of this one keeps the id while it moves the opening on
    const opening = getOpening();
    const dataSourceValue = dataSource.value;
    const anchorRowIndex = selectedCellRange.value?.rowStart ?? dataSourceValue.rows.length;
    const anchorColumnIndex = selectedCellRange.value?.columnStart ?? 0;
    const targetColumnNames = displayColumns.value.map((column) => column.name);
    await getResultAsync(async () => {
      const pastedValues = await readPastedValues();
      if (pastedValues.length === 0) return;
      // The paste is for the opening it was issued on, so a sheet that replaced it during the read takes none of it
      if (getOpening() !== opening) return;
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
