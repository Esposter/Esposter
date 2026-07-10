import type { Column } from "#shared/models/resource/file/column/Column";
import type { ToData } from "@esposter/shared";

import { UpdateColumnCommand } from "@/models/resource/file/commands/UpdateColumnCommand";
import { getOriginalRowValues } from "@/services/resource/file/getOriginalRowValues";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useUpdateColumn = () =>
  useFileCommand((dataSource, originalName: string, updatedColumn: ToData<Column>) => {
    const columnIndex = dataSource.columns.findIndex(({ name }) => name === originalName);
    if (columnIndex === -1) return undefined;
    const originalColumn = structuredClone(toRawDeep(takeOne(dataSource.columns, columnIndex)));
    const originalRowValues = getOriginalRowValues(dataSource, originalName);
    return new UpdateColumnCommand(
      originalName,
      originalColumn,
      structuredClone(toRawDeep(updatedColumn)),
      originalRowValues,
    );
  });
