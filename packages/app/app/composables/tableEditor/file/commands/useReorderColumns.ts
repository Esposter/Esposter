import type { Column } from "#shared/models/tableEditor/file/column/Column";

import { MoveColumnCommand } from "@/models/tableEditor/file/commands/MoveColumnCommand";
import { takeOne } from "@esposter/shared";

export const useReorderColumns = () =>
  useTableEditorCommand((editedItem, newColumns: Column[]) => {
    const oldColumns = editedItem.dataSource.columns;
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
