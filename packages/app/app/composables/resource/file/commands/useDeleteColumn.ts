import { DeleteColumnCommand } from "@/models/resource/file/commands/DeleteColumnCommand";
import { getOriginalRowValues } from "@/services/resource/file/getOriginalRowValues";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteColumn = () =>
  useFileCommand((dataSource, name: string) => {
    const columnIndex = dataSource.columns.findIndex((column) => column.name === name);
    if (columnIndex === -1) return undefined;
    const originalColumn = structuredClone(toRawDeep(takeOne(dataSource.columns, columnIndex)));
    const originalRowValues = getOriginalRowValues(dataSource, name);
    return new DeleteColumnCommand(columnIndex, originalColumn, originalRowValues);
  });
