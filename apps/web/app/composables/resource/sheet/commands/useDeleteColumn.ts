import { DeleteColumnsCommand } from "#shared/models/resource/sheet/commands/DeleteColumnsCommand";

export const useDeleteColumn = () =>
  useSheetCommand((dataSource, name: string) => {
    const column = dataSource.columns.find((candidate) => candidate.name === name);
    if (column) return new DeleteColumnsCommand([column.id]);
    else return undefined;
  });
