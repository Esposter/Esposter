import type { GridItem } from "#src/models/GridItem";
import type { GridPoint } from "#src/models/GridPoint";

// A grid on the page that an item dragged from elsewhere can be dropped onto
export interface MountedGrid {
  // Lands the item with its top-left under the point, and commits it as one addition
  accept: (item: Pick<GridItem, "h" | "id" | "w">, point: GridPoint) => void;
}
