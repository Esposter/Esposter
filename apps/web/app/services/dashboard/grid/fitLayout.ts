import type { GridItem } from "@/models/dashboard/GridItem";

import { compactLayout } from "@/services/dashboard/grid/compactLayout";
import { correctBounds } from "@/services/dashboard/grid/correctBounds";

// A layout on fewer columns: each item kept inside them, then compacted so none overlaps another
export const fitLayout = <T extends GridItem>(layout: T[], columnNumber: number) =>
  compactLayout(correctBounds(layout, columnNumber));
