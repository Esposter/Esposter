import type { GridCell } from "#src/models/GridCell";
import type { GridItem } from "#src/models/GridItem";

// A body drag released over another grid: the item, the cell it lands in there, and that grid's root element, which the
// Consumer reads its own data attribute from to know which group it is
export interface GridTransfer<T extends GridItem = GridItem> {
  cell: GridCell;
  item: T;
  target: HTMLElement;
}
