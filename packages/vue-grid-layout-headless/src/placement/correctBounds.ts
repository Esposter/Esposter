import type { GridItem } from "#src/models/GridItem";

import { GRID_MIN_SPAN } from "#src/services/constants";

// An item keeps at least one cell in each direction, and no more columns than the grid has, moved in from the right
// Edge if it hangs over it
export const correctBounds = <T extends GridItem>(layout: T[], columnNumber: number): T[] =>
  layout.map((item) => {
    const h = Math.max(GRID_MIN_SPAN, item.h);
    const w = Math.max(GRID_MIN_SPAN, Math.min(item.w, columnNumber));
    const x = Math.min(Math.max(item.x, 0), columnNumber - w);
    return { ...item, h, w, x };
  });
