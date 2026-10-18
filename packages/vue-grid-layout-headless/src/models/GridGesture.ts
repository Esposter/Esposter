import type { GridItem } from "#src/models/GridItem";
import type { GridPoint } from "#src/models/GridPoint";
import type { ResizeEdge } from "#src/models/ResizeEdge";

// A pointer gesture held over an item, from the press until the release or the cancel
export interface GridGesture<T extends GridItem = GridItem> {
  // The cell the gesture last previewed, so a move that stays within it rebuilds nothing
  cell?: GridItem;
  // The element the press began on, which takes the pointer once the gesture becomes a drag
  element: Element;
  // The edge or corner a resize pulls, or none for a move
  edge?: ResizeEdge;
  isStarted: boolean;
  // The item as it sat when the press began, which the gesture is measured from
  origin: T;
  // How far the pointer has travelled from where the press began
  offset: GridPoint;
  pointerId: number;
  start: GridPoint;
}
