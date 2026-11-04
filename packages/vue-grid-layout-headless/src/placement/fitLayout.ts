import type { CompactType } from "#src/models/CompactType";
import type { GridBlock } from "#src/models/GridBlock";

import { clampCell } from "#src/placement/clampCell";
import { compactLayout } from "#src/placement/compactLayout";

// A layout fitted to a grid of the given columns: its items within the columns, then compacted in the grid's direction
export const fitLayout = <T extends GridBlock>(
  layout: T[],
  columnNumber: number,
  compactType: CompactType,
  solidIds?: ReadonlySet<GridBlock["id"]>,
): T[] =>
  compactLayout(
    layout.map((item) => clampCell(item, columnNumber)),
    columnNumber,
    compactType,
    solidIds,
  );
