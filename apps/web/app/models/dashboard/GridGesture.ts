import type { GridGestureType } from "@/models/dashboard/GridGestureType";
import type { GridItem } from "@/models/dashboard/GridItem";
import type { GridTile } from "@/models/dashboard/GridTile";

export interface GridGesture {
  // The cell the gesture last previewed, so a move that stays within it rebuilds nothing
  cell?: GridItem;
  // The element the press began on, which takes the pointer once the gesture becomes a drag
  element: Element;
  // The tile as it sat when the press began, which the gesture is measured from
  origin: GridTile;
  // How far the pointer has travelled from where the press began, in client pixels
  offset: { x: number; y: number };
  isStarted: boolean;
  kind: GridGestureType;
  pointerId: number;
  start: { x: number; y: number };
}
