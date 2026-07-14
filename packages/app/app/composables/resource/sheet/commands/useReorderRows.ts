import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { MoveRowCommand } from "@/models/resource/sheet/commands/MoveRowCommand";

export const useReorderRows = () =>
  useSheetCommand((dataSource, newRows: Row[]) => {
    const oldRows = dataSource.rows;
    const oldIndexById = new Map(oldRows.map((row, index) => [row.id, index]));
    const newRelativePositionByRowId = new Map(newRows.map((row, index) => [row.id, index]));
    // Determine the expected relative position of each row within this page subset
    const expectedRelativePositionByRowId = new Map(
      oldRows.filter((row) => newRelativePositionByRowId.has(row.id)).map((row, index) => [row.id, index]),
    );

    let movedRelativePosition = -1;
    let fromIndex = -1;
    let maxDisplacement = 0;
    for (const [oldIndex, row] of oldRows.entries()) {
      const actualRelativePosition = newRelativePositionByRowId.get(row.id);
      if (actualRelativePosition === undefined) continue;
      const expectedRelativePosition = expectedRelativePositionByRowId.get(row.id);
      if (expectedRelativePosition === undefined) continue;
      const displacement = Math.abs(actualRelativePosition - expectedRelativePosition);
      if (displacement > maxDisplacement) {
        maxDisplacement = displacement;
        fromIndex = oldIndex;
        movedRelativePosition = actualRelativePosition;
      }
    }

    if (fromIndex === -1 || movedRelativePosition === -1 || maxDisplacement === 0) return undefined;

    let toIndex: number;
    if (movedRelativePosition === 0) {
      const nextRow = newRows.at(1);
      if (!nextRow) return undefined;
      const nextOldIndex = oldIndexById.get(nextRow.id);
      if (nextOldIndex === undefined) return undefined;
      toIndex = nextOldIndex;
    } else {
      const previousRow = newRows.at(movedRelativePosition - 1);
      if (!previousRow) return undefined;
      const previousOldIndex = oldIndexById.get(previousRow.id);
      if (previousOldIndex === undefined) return undefined;
      toIndex = previousOldIndex < fromIndex ? previousOldIndex + 1 : previousOldIndex;
    }

    if (fromIndex === toIndex) return undefined;
    return new MoveRowCommand(fromIndex, toIndex);
  });
