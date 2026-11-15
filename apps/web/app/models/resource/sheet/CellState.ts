import type { CellMode } from "@/models/resource/sheet/CellMode";
import type { CellPosition } from "@/models/resource/sheet/CellPosition";

export type CellState =
  | { anchor: CellPosition; focus: CellPosition; mode: typeof CellMode.Select }
  | { columnName: string; mode: typeof CellMode.Edit; rowIndex: number }
  | { mode: typeof CellMode.View };
