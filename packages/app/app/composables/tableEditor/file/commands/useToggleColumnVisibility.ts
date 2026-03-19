import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ToggleColumnVisibilityCommand } from "@/models/tableEditor/file/commands/ToggleColumnVisibilityCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useToggleColumnVisibility = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useFileHistoryStore();
  return (id: string) => {
    if (!editedItem.value?.dataSource) return;
    const column = editedItem.value.dataSource.columns.find((column) => column.id === id);
    if (!column) return;
    const command = new ToggleColumnVisibilityCommand(id, column.name, column.hidden);
    command.execute(editedItem.value);
    push(command);
  };
};
