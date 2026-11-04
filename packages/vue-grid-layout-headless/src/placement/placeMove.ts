import type { GridBlock } from "#src/models/GridBlock";
import type { GridLayoutOptions } from "#src/models/GridLayoutOptions";

import { compactLayout } from "#src/placement/compactLayout";
import { resolveMove } from "#src/placement/resolveMove";

// The layout a move lands in: the target resolved under the collision mode, then compacted in the grid's direction. A move the
// Mode refuses has no layout, so the result is undefined
export const placeMove = <T extends GridBlock>(
  layout: T[],
  target: GridBlock,
  { collision, columnNumber, compactType }: Pick<GridLayoutOptions, "collision" | "columnNumber" | "compactType">,
): T[] | undefined => {
  const resolvedLayout = resolveMove(layout, target, collision, columnNumber);
  return resolvedLayout && compactLayout(resolvedLayout, columnNumber, compactType);
};
