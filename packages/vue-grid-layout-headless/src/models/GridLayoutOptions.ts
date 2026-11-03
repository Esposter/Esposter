import type { GridItem } from "#src/models/GridItem";
import type { GridSpacing } from "#src/models/GridSpacing";

// What a grid lays out and how its gestures read the pointer. A consumer passes these as a getter, so a changed prop is
// Read the next time the grid lays out
export interface GridLayoutOptions<T extends GridItem = GridItem> {
  columnNumber: number;
  // How far a press's pointer travels before the press is a drag, so a press that barely moves stays a click
  dragStartDistance: number;
  isEditable: boolean;
  items: T[];
  // Receives the cells one gesture changed, once, when its pointer is released
  onCommit: (changes: GridItem[]) => void;
  rowHeight: number;
  spacing: GridSpacing;
}
