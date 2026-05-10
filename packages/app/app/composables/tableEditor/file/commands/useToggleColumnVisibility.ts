import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { ToggleColumnVisibilityCommand } from "@/models/tableEditor/file/commands/ToggleColumnVisibilityCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useToggleColumnVisibility = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (id: string) => {
    if (!editedItem.value?.dataSource) return;
    const column = editedItem.value.dataSource.columns.find((column) => column.id === id);
    if (!column) return;
    const command = new ToggleColumnVisibilityCommand(id, column.name, column.hidden);
    command.execute(editedItem.value);
    push(command);
  };
};
