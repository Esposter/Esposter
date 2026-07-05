import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ToData } from "@esposter/shared";

import { UpdateColumnCommand } from "@/models/tableEditor/file/commands/UpdateColumnCommand";
import { getOriginalRowValues } from "@/services/tableEditor/file/getOriginalRowValues";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useUpdateColumn = () =>
  useTableEditorCommand((editedItem, originalName: string, updatedColumn: ToData<Column>) => {
    const columnIndex = editedItem.dataSource.columns.findIndex(({ name }) => name === originalName);
    if (columnIndex === -1) return undefined;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.dataSource.columns, columnIndex)));
    const originalRowValues = getOriginalRowValues(editedItem.dataSource, originalName);
    return new UpdateColumnCommand(
      originalName,
      originalColumn,
      structuredClone(toRawDeep(updatedColumn)),
      originalRowValues,
    );
  });
