import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { DeleteColumnCommand } from "@/models/tableEditor/file/commands/DeleteColumnCommand";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useDeleteColumn = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useFileHistoryStore();
  return (name: string) => {
    if (!editedItem.value?.dataSource) return;
    const columnIndex = editedItem.value.dataSource.columns.findIndex((column) => column.name === name);
    if (columnIndex === -1) return;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.columns, columnIndex)));
    const originalRowValues = editedItem.value.dataSource.rows.map((row) => takeOne(toRawDeep(row).data, name));
    const command = new DeleteColumnCommand(columnIndex, originalColumn, originalRowValues);
    command.execute(editedItem.value);
    push(command);
  };
};
