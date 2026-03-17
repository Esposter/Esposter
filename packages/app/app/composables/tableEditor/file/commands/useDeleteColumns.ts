import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { IndexedColumn } from "@/models/tableEditor/file/commands/IndexedColumn";

import { DeleteColumnsCommand } from "@/models/tableEditor/file/commands/DeleteColumnsCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteColumns = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useDataSourceHistory();
  return (ids: string[]) => {
    if (!editedItem.value?.dataSource) return;
    const dataSource = editedItem.value.dataSource;
    const indexedColumns: IndexedColumn[] = [];
    for (const id of ids) {
      const columnIndex = dataSource.columns.findIndex((column) => column.id === id);
      if (columnIndex === -1) continue;
      const originalColumn = structuredClone(toRawDeep(takeOne(dataSource.columns, columnIndex)));
      const originalRowValues = dataSource.rows.map((row) => takeOne(toRawDeep(row).data, originalColumn.name));
      indexedColumns.push({ columnIndex, originalColumn, originalRowValues });
    }
    if (indexedColumns.length === 0) return;
    const command = new DeleteColumnsCommand(indexedColumns);
    command.execute(editedItem.value);
    push(command);
  };
};
