import type { CollisionMode } from "#src/models/CollisionMode";
import type { CompactType } from "#src/models/CompactType";
import type { GridCommit } from "#src/models/GridCommit";
import type { GridItem } from "#src/models/GridItem";
import type { GridRefusal } from "#src/models/GridRefusal";
import type { GridSpacing } from "#src/models/GridSpacing";
import type { GridTransfer } from "#src/models/GridTransfer";

// What a grid lays out and how its gestures read the pointer. A consumer passes these as a getter, so a changed prop is
// Read the next time the grid lays out
export interface GridLayoutOptions<T extends GridItem = GridItem> {
  // Whether this grid refuses an item dragged into it, from another grid or from outside. A refused item is previewed nowhere
  // Over the grid and lands nothing, so the grid never lays out a landing for an item it will not take
  checkIsRefused?: GridRefusal;
  // Whether an item is solid, so no other item's drag displaces it: a landing that overlaps it is refused under every collision
  // Mode, and neither a push nor a compaction moves it. The item dragged by its own press still moves and pushes the others
  checkIsSolid?: (item: T) => boolean;
  // What a dropped item does to the items it lands on
  collision: CollisionMode;
  columnNumber: number;
  // The direction items compact in once placed, and where a dropped item stays
  compactType: CompactType;
  // How far a press's pointer travels before the press is a drag, so a press that barely moves stays a click
  dragStartDistance: number;
  isEditable: boolean;
  items: T[];
  // Receives what one gesture, step or drop changed, once, when it lands, and what an auto-height item's reported
  // Content changed
  onCommit: (commit: GridCommit) => void;
  // Receives a body drag released over another grid that takes it, once, with the cell the item lands in there. Without it a
  // Drag stays in its own grid
  onTransfer?: (transfer: GridTransfer<T>) => void;
  rowHeight: number;
  spacing: GridSpacing;
}
