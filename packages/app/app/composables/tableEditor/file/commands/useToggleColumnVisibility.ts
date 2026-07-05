import { ToggleColumnVisibilityCommand } from "@/models/tableEditor/file/commands/ToggleColumnVisibilityCommand";

export const useToggleColumnVisibility = () =>
  useTableEditorCommand((editedItem, id: string) => {
    const column = editedItem.dataSource.columns.find((column) => column.id === id);
    if (!column) return undefined;
    return new ToggleColumnVisibilityCommand(id, column.name, column.hidden);
  });
