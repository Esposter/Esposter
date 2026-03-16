import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { DeleteRowCommand } from "@/models/tableEditor/file/commands/DeleteRowCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteRow = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useDataSourceHistory();

  return (id: string) => {
    if (!editedItem.value?.dataSource) return;
    const index = editedItem.value.dataSource.rows.findIndex((row) => row.id === id);
    if (index === -1) return;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
    const command = new DeleteRowCommand(index, originalRow);
    command.execute(editedItem.value);
    push(command);
  };
};
