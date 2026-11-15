import type { CellMode } from "#src/models/resource/sheet/CellMode";
import type { CellPosition } from "#src/models/resource/sheet/CellPosition";

export type CellState =
  | { anchor: CellPosition; focus: CellPosition; mode: typeof CellMode.Select }
  | { columnName: string; mode: typeof CellMode.Edit; rowIndex: number }
  | { mode: typeof CellMode.View };
