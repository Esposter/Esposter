import { DeleteColumnsCommand } from "#shared/models/resource/sheet/commands/DeleteColumnsCommand";

export const useDeleteColumns = () =>
  useSheetCommand((dataSource, ids: string[]) => {
    const idSet = new Set(ids);
    if (dataSource.columns.some(({ id }) => idSet.has(id))) return new DeleteColumnsCommand(ids);
    else return undefined;
  });
