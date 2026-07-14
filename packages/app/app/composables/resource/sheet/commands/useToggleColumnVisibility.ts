import { ToggleColumnVisibilityCommand } from "@/models/resource/sheet/commands/ToggleColumnVisibilityCommand";

export const useToggleColumnVisibility = () =>
  useSheetCommand((dataSource, id: string) => {
    const column = dataSource.columns.find((column) => column.id === id);
    if (!column) return undefined;
    return new ToggleColumnVisibilityCommand(id, column.name, column.hidden);
  });
