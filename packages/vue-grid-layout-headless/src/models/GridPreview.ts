import type { GridBlock } from "#src/models/GridBlock";
import type { GridItem } from "#src/models/GridItem";

// Where a drag or a drop would land: the cell its item is drawn at, whether the collision mode refuses it, and the layout it
// Leaves, which is the grid's own layout when it is refused
export interface GridPreview {
  cell: GridBlock;
  isRefused: boolean;
  layout: GridItem[];
}
