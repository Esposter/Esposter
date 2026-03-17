import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { Row } from "#shared/models/tableEditor/file/Row";
import { UpdateRowCommand } from "@/models/tableEditor/file/commands/UpdateRowCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useUpdateRow = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useDataSourceHistory();
  return (updatedRow: Row) => {
    if (!editedItem.value?.dataSource) return;
    const index = editedItem.value.dataSource.rows.findIndex((row) => row.id === updatedRow.id);
    if (index === -1) return;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
    const command = new UpdateRowCommand(index, originalRow, structuredClone(toRawDeep(updatedRow)));
    command.execute(editedItem.value);
    push(command);
  };
};
