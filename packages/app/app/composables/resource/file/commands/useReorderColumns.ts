import type { Column } from "#shared/models/resource/file/column/Column";

import { MoveColumnCommand } from "@/models/resource/file/commands/MoveColumnCommand";
import { takeOne } from "@esposter/shared";

export const useReorderColumns = () =>
  useFileCommand((dataSource, newColumns: Column[]) => {
    const oldColumns = dataSource.columns;
    let fromIndex = -1;
    let toIndex = -1;
    let maxDisplacement = 0;
    for (const [oldIndex, column] of oldColumns.entries()) {
      const newIndex = newColumns.findIndex(({ id }) => id === column.id);
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
