import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { MoveColumnCommand } from "@/models/tableEditor/file/commands/MoveColumnCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";

export const useReorderColumns = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useFileHistoryStore();
  return (newColumns: DataSource["columns"]) => {
    if (!editedItem.value?.dataSource) return;
    const oldColumns = editedItem.value.dataSource.columns;
    let fromIndex = -1;
    let toIndex = -1;
    let maxDisplacement = 0;
    for (const [oldIndex, column] of oldColumns.entries()) {
      const newIndex = newColumns.findIndex(({ id }) => id === column.id);
      const displacement = Math.abs(newIndex - oldIndex);
      if (displacement > maxDisplacement) {
        maxDisplacement = displacement;
        fromIndex = oldIndex;
        toIndex = newIndex;
      }
    }
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const movedColumn = takeOne(oldColumns, fromIndex);
    const toColumnName = oldColumns[toIndex]?.name ?? "";
    const command = new MoveColumnCommand(fromIndex, toIndex, movedColumn.name, toColumnName);
    command.execute(editedItem.value);
    push(command);
  };
};
