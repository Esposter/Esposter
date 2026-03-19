import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import { CreateColumnCommand } from "@/models/tableEditor/file/commands/CreateColumnCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useCreateColumn = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useFileHistoryStore();
  return (newColumn: DataSource["columns"][number]) => {
    if (!editedItem.value?.dataSource) return;
    const { id: _id, ...newColumnWithoutId } = newColumn;
    const createdColumn =
      newColumnWithoutId.type === ColumnType.Date
        ? new DateColumn(newColumnWithoutId)
        : (new Column(newColumnWithoutId) as DataSource["columns"][number]);
    const columnIndex = editedItem.value.dataSource.columns.length;
    const command = new CreateColumnCommand(columnIndex, createdColumn);
    command.execute(editedItem.value);
    push(command);
  };
};
