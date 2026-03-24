import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";
import type { ToData } from "@esposter/shared";

import { UpdateColumnCommand } from "@/models/tableEditor/file/commands/UpdateColumnCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useUpdateColumn = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (originalName: string, updatedColumn: ToData<DataSource["columns"][number]>) => {
    if (!editedItem.value?.dataSource) return;
    const columnIndex = editedItem.value.dataSource.columns.findIndex(({ name }) => name === originalName);
    if (columnIndex === -1) return;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.columns, columnIndex)));
    const originalRowValues = editedItem.value.dataSource.rows.map((row) => takeOne(toRawDeep(row).data, originalName));
    const command = new UpdateColumnCommand(
      originalName,
      originalColumn,
      structuredClone(toRawDeep(updatedColumn)),
      originalRowValues,
    );
    command.execute(editedItem.value);
    push(command);
  };
};
