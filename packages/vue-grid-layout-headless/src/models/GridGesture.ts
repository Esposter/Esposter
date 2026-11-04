import type { GridBlock } from "#src/models/GridBlock";
import type { GridPoint } from "#src/models/GridPoint";
import type { MountedGrid } from "#src/models/MountedGrid";
import type { ResizeEdge } from "#src/models/ResizeEdge";

// A pointer gesture held over an item, from the press until the release or the cancel
export interface GridGesture<T extends GridBlock = GridBlock> {
  // The cell the gesture last previewed, so a move that stays within it rebuilds nothing
  cell?: GridBlock;
  // The edge or corner a resize pulls, or none for a move
  edge?: ResizeEdge;
  // The element the press began on, which takes the pointer once the gesture becomes a drag
  element: Element;
  isStarted: boolean;
  // How far the pointer has travelled from where the press began
  offset: GridPoint;
  // The item as it sat when the press began, which the gesture is measured from
  origin: T;
  pointerId: number;
  start: GridPoint;
  // The other grid the pointer is over, which a body drag previews on and hands its release to. Undefined over its own grid
  // Or over no grid
  transfer?: MountedGrid;
}
