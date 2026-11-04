import type { CompactType } from "#src/models/CompactType";
import type { GridItem } from "#src/models/GridItem";

import { compactLayout } from "#src/placement/compactLayout";
import { correctBounds } from "#src/placement/correctBounds";

// A layout fitted to a grid of the given columns: its items within the columns, then compacted in the grid's direction
export const fitLayout = <T extends GridItem>(layout: T[], columnNumber: number, compactType: CompactType): T[] =>
  compactLayout(correctBounds(layout, columnNumber), columnNumber, compactType);
