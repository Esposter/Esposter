import type { CellMode } from "@/models/resource/sheet/CellMode";
import type { CellPosition } from "@/models/resource/sheet/CellPosition";

export type CellState =
  | { anchor: CellPosition; focus: CellPosition; mode: CellMode.Select }
  | { columnName: string; mode: CellMode.Edit; rowIndex: number }
  | { mode: CellMode.View };
