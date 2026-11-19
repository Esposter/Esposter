import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ToData } from "@esposter/shared";

import { MoveColumnCommand } from "#shared/models/resource/sheet/commands/MoveColumnCommand";
import { findLargestDisplacement } from "#src/services/resource/sheet/commands/findLargestDisplacement";
import { takeOne } from "@esposter/shared";

export const useReorderColumns = () =>
  useSheetCommand((dataSource, newColumns: ToData<Column>[]) => {
    const oldColumns = dataSource.columns;
    const newColumnIdIndexMap = new Map(newColumns.map((column, index) => [column.id, index]));
    // A column the new order lacks lands at -1, which no move can target
    const movedColumn = findLargestDisplacement(
      oldColumns.map((column, oldIndex) => ({
        actualIndex: newColumnIdIndexMap.get(column.id) ?? -1,
        expectedIndex: oldIndex,
        sourceIndex: oldIndex,
      })),
    );
    if (!movedColumn || movedColumn.actualIndex === -1) return undefined;

    const fromIndex = movedColumn.sourceIndex;
    const toIndex = movedColumn.actualIndex;
    const toColumnName = oldColumns[toIndex]?.name ?? "";
    return new MoveColumnCommand(fromIndex, toIndex, takeOne(oldColumns, fromIndex).name, toColumnName);
  });
