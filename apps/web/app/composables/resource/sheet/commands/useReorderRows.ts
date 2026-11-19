import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { MoveRowCommand } from "#src/models/resource/sheet/commands/MoveRowCommand";
import { findLargestDisplacement } from "#src/services/resource/sheet/commands/findLargestDisplacement";

export const useReorderRows = () =>
  useSheetCommand((dataSource, newRows: ToData<Row>[]) => {
    const oldRows = dataSource.rows;
    const oldRowIdIndexMap = new Map(oldRows.map((row, index) => [row.id, index]));
    const newRowIdRelativePositionMap = new Map(newRows.map((row, index) => [row.id, index]));
    // The rows of this page subset in their old order: a row's index among them is where it was expected to land
    const pagePositions = oldRows.flatMap((row, oldIndex) => {
      const actualRelativePosition = newRowIdRelativePositionMap.get(row.id);
      return actualRelativePosition === undefined ? [] : [{ actualRelativePosition, oldIndex }];
    });
    const movedRow = findLargestDisplacement(
      pagePositions.map(({ actualRelativePosition, oldIndex }, expectedRelativePosition) => ({
        actualIndex: actualRelativePosition,
        expectedIndex: expectedRelativePosition,
        sourceIndex: oldIndex,
      })),
    );
    if (!movedRow) return undefined;

    const fromIndex = movedRow.sourceIndex;
    const movedRelativePosition = movedRow.actualIndex;
    let toIndex: number;
    if (movedRelativePosition === 0) {
      const nextRow = newRows.at(1);
      if (!nextRow) return undefined;
      const nextOldIndex = oldRowIdIndexMap.get(nextRow.id);
      if (nextOldIndex === undefined) return undefined;
      toIndex = nextOldIndex;
    } else {
      const previousRow = newRows.at(movedRelativePosition - 1);
      if (!previousRow) return undefined;
      const previousOldIndex = oldRowIdIndexMap.get(previousRow.id);
      if (previousOldIndex === undefined) return undefined;
      toIndex = previousOldIndex < fromIndex ? previousOldIndex + 1 : previousOldIndex;
    }

    if (fromIndex === toIndex) return undefined;
    else return new MoveRowCommand(fromIndex, toIndex);
  });
