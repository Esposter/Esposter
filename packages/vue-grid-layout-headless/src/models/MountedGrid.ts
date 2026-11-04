import type { GridCell } from "#src/models/GridCell";
import type { GridItem } from "#src/models/GridItem";
import type { GridPoint } from "#src/models/GridPoint";

// A grid on the page that an item dragged from elsewhere can be previewed over and dropped onto
export interface MountedGrid {
  // Lands the item with its top-left under the point and commits what its landing moved. Under prevent a landing on another
  // Item is refused, so nothing is committed. Returns the cell the item landed in, or undefined when it did not land
  accept: (item: GridItem, point: GridPoint) => GridCell | undefined;
  clearPreview: () => void;
  // The grid's root element, which the grid is registered under and which a hand-over names
  element: HTMLElement;
  // Shows the cell the item would land on under the point, marked refused where the grid would refuse it. Returns whether the
  // Grid previews the item at all, which is false where it refuses the item outright
  preview: (item: GridItem, point: GridPoint) => boolean;
}
