import type { GridItem } from "#src/models/GridItem";
import type { GridLayoutOptions } from "#src/models/GridLayoutOptions";

import { compactLayout } from "#src/placement/compactLayout";
import { resolveMove } from "#src/placement/resolveMove";

// The layout a move lands in: the target resolved under the collision mode, then compacted in the grid's direction
export const placeMove = <T extends GridItem>(
  layout: T[],
  target: GridItem,
  { collision, columnNumber, compactType }: Pick<GridLayoutOptions, "collision" | "columnNumber" | "compactType">,
): T[] => compactLayout(resolveMove(layout, target, collision), columnNumber, compactType);
