import type { GridItem } from "#src/models/GridItem";
import type { GridPoint } from "#src/models/GridPoint";

// A pointer gesture held over an item, from the press until the release or the cancel
export interface GridGesture<T extends GridItem = GridItem> {
  // The cell the gesture last previewed, so a move that stays within it rebuilds nothing
  cell?: GridItem;
  // The element the press began on, which takes the pointer once the gesture becomes a drag
  element: Element;
  // Whether the gesture resizes the item from its south-east corner, or moves it
  isResize: boolean;
  isStarted: boolean;
  // How far the pointer has travelled from where the press began
  offset: GridPoint;
  // The item as it sat when the press began, which the gesture is measured from
  origin: T;
  pointerId: number;
  start: GridPoint;
}
