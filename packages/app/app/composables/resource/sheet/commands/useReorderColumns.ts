import type { Column } from "#shared/models/resource/sheet/column/Column";

import { MoveColumnCommand } from "@/models/resource/sheet/commands/MoveColumnCommand";
import { takeOne } from "@esposter/shared";

export const useReorderColumns = () =>
  useSheetCommand((dataSource, newColumns: Column[]) => {
    const oldColumns = dataSource.columns;
    const newColumnIdIndexMap = new Map(newColumns.map((column, index) => [column.id, index]));
    let fromIndex = -1;
    let toIndex = -1;
    let maxDisplacement = 0;
    for (const [oldIndex, column] of oldColumns.entries()) {
      const newIndex = newColumnIdIndexMap.get(column.id) ?? -1;
      const displacement = Math.abs(newIndex - oldIndex);
      if (displacement > maxDisplacement) {
        maxDisplacement = displacement;
        fromIndex = oldIndex;
        toIndex = newIndex;
      }
    }
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return undefined;
    const movedColumn = takeOne(oldColumns, fromIndex);
    const toColumnName = oldColumns[toIndex]?.name ?? "";
    return new MoveColumnCommand(fromIndex, toIndex, movedColumn.name, toColumnName);
  });
