import type { GridGeometry } from "#src/models/GridGeometry";
import type { GridItem } from "#src/models/GridItem";
import type { GridPoint } from "#src/models/GridPoint";

// An item as the grid draws it: its box, and the offset a dragged item is drawn at, so it stays under the pointer
export interface GridTile<T extends GridItem = GridItem> {
  geometry: GridGeometry;
  isDragged: boolean;
  item: T;
  offset: GridPoint;
}
