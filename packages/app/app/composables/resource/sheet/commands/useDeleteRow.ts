import { DeleteRowCommand } from "@/models/resource/sheet/commands/DeleteRowCommand";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteRow = () =>
  useSheetCommand((dataSource, id: string) => {
    const index = dataSource.rows.findIndex((row) => row.id === id);
    if (index === -1) return undefined;
    const originalRow = structuredClone(toRawDeep(takeOne(dataSource.rows, index)));
    return new DeleteRowCommand(index, originalRow);
  });
