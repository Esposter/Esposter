import type { UiGridPosition } from "@/models/ui/UiGridPosition";
import type { UiGridSize } from "@/models/ui/UiGridSize";

import { DATA_TABLE_PAGE_KEY_ROW_COUNT } from "@/services/ui/constants";

const clamp = (value: number, count: number) => Math.min(Math.max(value, 0), count - 1);
// Where a key moves a grid's active cell, as the WAI-ARIA grid pattern walks one: an arrow a cell at a time and never
// Past the edge, Home and End to the ends of the row, or of the grid with Ctrl, and Page Up and Page Down a run of rows.
// Undefined for any other key, and for a key held with a modifier the grid does not read, which it leaves to whatever
// Command binds that chord
export const getNextGridCellPosition = (
  event: KeyboardEvent,
  { columnIndex, rowIndex }: UiGridPosition,
  { columnCount, rowCount }: UiGridSize,
) => {
  if (event.altKey || event.metaKey || event.shiftKey) return undefined;
  else if (event.ctrlKey)
    switch (event.key) {
      case "End":
        return { columnIndex: columnCount - 1, rowIndex: rowCount - 1 };
      case "Home":
        return { columnIndex: 0, rowIndex: 0 };
      default:
        return undefined;
    }

  switch (event.key) {
    case "ArrowDown":
      return { columnIndex, rowIndex: clamp(rowIndex + 1, rowCount) };
    case "ArrowLeft":
      return { columnIndex: clamp(columnIndex - 1, columnCount), rowIndex };
    case "ArrowRight":
      return { columnIndex: clamp(columnIndex + 1, columnCount), rowIndex };
    case "ArrowUp":
      return { columnIndex, rowIndex: clamp(rowIndex - 1, rowCount) };
    case "End":
      return { columnIndex: columnCount - 1, rowIndex };
    case "Home":
      return { columnIndex: 0, rowIndex };
    case "PageDown":
      return { columnIndex, rowIndex: clamp(rowIndex + DATA_TABLE_PAGE_KEY_ROW_COUNT, rowCount) };
    case "PageUp":
      return { columnIndex, rowIndex: clamp(rowIndex - DATA_TABLE_PAGE_KEY_ROW_COUNT, rowCount) };
    default:
      return undefined;
  }
};
