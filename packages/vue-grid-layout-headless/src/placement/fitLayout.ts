import type { GridItem } from "#src/models/GridItem";

import { compactLayout } from "#src/placement/compactLayout";
import { correctBounds } from "#src/placement/correctBounds";

// A layout fitted to a grid of the given columns: its items within the columns, then compacted upward
export const fitLayout = <T extends GridItem>(layout: T[], columnNumber: number): T[] =>
  compactLayout(correctBounds(layout, columnNumber));
