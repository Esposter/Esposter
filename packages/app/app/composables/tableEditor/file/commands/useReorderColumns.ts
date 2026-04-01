import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { MoveColumnCommand } from "@/models/tableEditor/file/commands/MoveColumnCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";

export const useReorderColumns = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (newColumns: Column[]) => {
    if (!editedItem.value?.dataSource) return;
    const allColumns = editedItem.value.dataSource.columns;
    const newIds = newColumns.map((column) => column.id);
    const newIdsSet = new Set(newIds);
    const oldRelevantColumns = allColumns
      .toSorted((a, b) => a.order - b.order)
      .filter((column) => newIdsSet.has(column.id));
    let fromRelevantIndex = -1;
    let toRelevantIndex = -1;
    let maxDisplacement = 0;
    for (const [oldIdx, column] of oldRelevantColumns.entries()) {
      const newIdx = newIds.indexOf(column.id);
      const displacement = Math.abs(newIdx - oldIdx);
      if (displacement > maxDisplacement) {
        maxDisplacement = displacement;
        fromRelevantIndex = oldIdx;
        toRelevantIndex = newIdx;
      }
    }
    if (fromRelevantIndex === -1 || toRelevantIndex === -1 || fromRelevantIndex === toRelevantIndex) return;
    const movedColumn = takeOne(oldRelevantColumns, fromRelevantIndex);
    const targetColumn = takeOne(oldRelevantColumns, toRelevantIndex);
    const command = new MoveColumnCommand(movedColumn.order, targetColumn.order, movedColumn.name, targetColumn.name);
    command.execute(editedItem.value);
    push(command);
  };
};
