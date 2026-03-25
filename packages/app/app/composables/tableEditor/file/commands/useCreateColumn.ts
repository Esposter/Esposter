import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { Column } from "#shared/models/tableEditor/file/column/Column";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import { CreateColumnCommand } from "@/models/tableEditor/file/commands/CreateColumnCommand";
import { CreateComputedColumnCommand } from "@/models/tableEditor/file/commands/CreateComputedColumnCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useCreateColumn = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (newColumn: DataSource["columns"][number]) => {
    if (!editedItem.value?.dataSource) return;
    const { id: _id, ...newColumnWithoutId } = newColumn;
    const columnIndex = editedItem.value.dataSource.columns.length;
    if (newColumnWithoutId.type === ColumnType.Computed) {
      const createdColumn = new ComputedColumn(newColumnWithoutId as ComputedColumn);
      const command = new CreateComputedColumnCommand(columnIndex, createdColumn);
      command.execute(editedItem.value);
      push(command);
      return;
    }
    const createdColumn =
      newColumnWithoutId.type === ColumnType.Date
        ? new DateColumn(newColumnWithoutId)
        : (new Column(newColumnWithoutId) as DataSource["columns"][number]);
    const command = new CreateColumnCommand(columnIndex, createdColumn);
    command.execute(editedItem.value);
    push(command);
  };
};
