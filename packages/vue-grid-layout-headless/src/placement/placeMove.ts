import type { GridItem } from "#src/models/GridItem";

import { compactLayout } from "#src/placement/compactLayout";
import { moveItem } from "#src/placement/moveItem";

// The layout a move lands in: the items the target lands on are pushed aside, then the layout compacts upward
export const placeMove = <T extends GridItem>(layout: T[], target: GridItem): T[] =>
  compactLayout(moveItem(layout, target));
