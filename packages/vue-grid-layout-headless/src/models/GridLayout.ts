import type { GridGeometry } from "#src/models/GridGeometry";
import type { GridItem } from "#src/models/GridItem";
import type { GridTile } from "#src/models/GridTile";
import type { ResizeEdge } from "#src/models/ResizeEdge";
import type { ComputedRef } from "vue";

// What a grid hands its consumer: the boxes to draw, the placeholder of a drag, the height the grid needs, and the press
export interface GridLayout<T extends GridItem = GridItem> {
  gridHeight: ComputedRef<number>;
  placeholder: ComputedRef<GridGeometry | undefined>;
  startGesture: (event: PointerEvent, item: T, edge?: ResizeEdge) => void;
  tiles: ComputedRef<GridTile<T>[]>;
}
