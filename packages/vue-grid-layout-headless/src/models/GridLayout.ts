import type { GridItem } from "#src/models/GridItem";
import type { GridPlaceholder } from "#src/models/GridPlaceholder";
import type { GridStep } from "#src/models/GridStep";
import type { GridTile } from "#src/models/GridTile";
import type { ResizeEdge } from "#src/models/ResizeEdge";
import type { ComputedRef } from "vue";

// What a grid hands its consumer: the boxes to draw, the placeholder of a drag, the height the grid needs, and the press and step
export interface GridLayout<T extends GridItem = GridItem> {
  gridHeight: ComputedRef<number>;
  placeholder: ComputedRef<GridPlaceholder | undefined>;
  // Reports the content height of an auto-height item, which takes the whole rows that hold it
  reportContentHeight: (id: string, contentHeight: number) => void;
  startGesture: (event: PointerEvent, item: T, edge?: ResizeEdge) => void;
  // Steps an item by whole cells and reports whether the step was committed, so a refused or empty step returns false
  stepItem: (id: string, step: GridStep) => boolean;
  tiles: ComputedRef<GridTile<T>[]>;
}
