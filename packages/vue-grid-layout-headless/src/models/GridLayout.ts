import type { GridGeometry } from "#src/models/GridGeometry";
import type { GridGestureType } from "#src/models/GridGestureType";
import type { GridItem } from "#src/models/GridItem";
import type { GridTile } from "#src/models/GridTile";
import type { ComputedRef } from "vue";

// What a grid hands its consumer: the boxes to draw, the placeholder of a drag, the height the grid needs, and the press
export interface GridLayout<T extends GridItem = GridItem> {
  gridHeight: ComputedRef<number>;
  placeholder: ComputedRef<GridGeometry | undefined>;
  startGesture: (event: PointerEvent, item: T, kind: GridGestureType) => void;
  tiles: ComputedRef<GridTile<T>[]>;
}
