import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ComputedColumn } from "#shared/models/tableEditor/file/ComputedColumn";
import { CreateComputedColumnCommand } from "@/models/tableEditor/file/commands/CreateComputedColumnCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useCreateComputedColumn = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (newColumn: ComputedColumn) => {
    if (!editedItem.value?.dataSource) return;
    const { id: _id, ...newColumnWithoutId } = newColumn;
    const createdColumn = new ComputedColumn(newColumnWithoutId);
    const columnIndex = editedItem.value.dataSource.columns.length;
    const command = new CreateComputedColumnCommand(columnIndex, createdColumn);
    command.execute(editedItem.value);
    push(command);
  };
};
