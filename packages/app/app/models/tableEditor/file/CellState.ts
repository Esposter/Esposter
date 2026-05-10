import type { CellMode } from "@/models/tableEditor/file/CellMode";
import type { CellPosition } from "@/models/tableEditor/file/CellPosition";

export type CellState =
  | { anchor: CellPosition; focus: CellPosition; isSelecting: boolean; mode: CellMode.Select }
  | { columnName: string; mode: CellMode.Edit; rowIndex: number }
  | { mode: CellMode.View };
