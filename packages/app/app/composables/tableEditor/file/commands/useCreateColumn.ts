import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { ColumnTypeCommandMap } from "@/services/tableEditor/file/column/ColumnTypeCommandMap";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useCreateColumn = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (newColumn: Column) => {
    if (!editedItem.value?.dataSource) return;
    const { id: _id, ...newColumnWithoutId } = newColumn;
    const columnIndex = editedItem.value.dataSource.columns.length;
    const command = ColumnTypeCommandMap[newColumnWithoutId.type](columnIndex, newColumnWithoutId as never);
    command.execute(editedItem.value);
    push(command);
  };
};
