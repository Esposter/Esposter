import { DeleteColumnCommand } from "#shared/models/resource/sheet/commands/DeleteColumnCommand";

export const useDeleteColumn = () =>
  useSheetCommand((dataSource, name: string) => {
    if (dataSource.columns.some((column) => column.name === name)) return new DeleteColumnCommand(name);
    else return undefined;
  });
