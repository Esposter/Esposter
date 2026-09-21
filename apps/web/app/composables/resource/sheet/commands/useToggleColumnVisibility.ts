import { ToggleColumnVisibilityCommand } from "@/models/resource/sheet/commands/ToggleColumnVisibilityCommand";

export const useToggleColumnVisibility = () =>
  useSheetCommand((dataSource, id: string) => {
    const column = dataSource.columns.find((candidateColumn) => candidateColumn.id === id);
    if (column) return new ToggleColumnVisibilityCommand(id, column.name, column.isHidden);
    else return undefined;
  });
