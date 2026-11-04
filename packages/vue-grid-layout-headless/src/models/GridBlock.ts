import type { GridCell } from "#src/models/GridCell";

// A cell the grid places, named by its id: what the placement functions move, resolve and commit
export interface GridBlock extends GridCell {
  id: string;
}
