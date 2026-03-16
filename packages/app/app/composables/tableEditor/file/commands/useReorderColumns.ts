import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { MoveColumnCommand } from "@/models/tableEditor/file/commands/MoveColumnCommand";
import { useTableEditorStore } from "@/store/tableEditor";

export const useReorderColumns = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useDataSourceHistory();

  return (newColumns: DataSource["columns"]) => {
    if (!editedItem.value?.dataSource) return;
    const oldColumns = editedItem.value.dataSource.columns;
    const movedColumn = newColumns.find((column, index) => column.id !== oldColumns[index]?.id);
    if (!movedColumn) return;
    const fromIndex = oldColumns.findIndex(({ id }) => id === movedColumn.id);
    const toIndex = newColumns.findIndex(({ id }) => id === movedColumn.id);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const toColumnName = oldColumns[toIndex]?.name ?? "";
    const command = new MoveColumnCommand(fromIndex, toIndex, movedColumn.name, toColumnName);
    command.execute(editedItem.value);
    push(command);
  };
};
