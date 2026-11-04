import type { GridBlock } from "#src/models/GridBlock";
import type { GridCell } from "#src/models/GridCell";

import { checkIsColliding } from "#src/placement/checkIsColliding";
import { clampCell } from "#src/placement/clampCell";

// The first cell a new item of the given span fits in, scanning rows from the top and columns from the left, so a new item
// Lands beside the items already in a row before it lands below them
export const getFirstFreeCell = (
  layout: GridBlock[],
  columnNumber: number,
  span: { h: number; w: number },
): GridCell => {
  const { h, w } = clampCell({ h: span.h, w: span.w, x: 0, y: 0 }, columnNumber);
  // The row below the lowest item holds nothing, so the scan returns by that row at the latest
  for (let y = 0; ; y += 1)
    for (let x = 0; x <= columnNumber - w; x += 1) {
      const cell = { h, w, x, y };
      if (!layout.some((item) => checkIsColliding(cell, item))) return cell;
    }
};
