import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { MoveRowCommand } from "@/models/tableEditor/file/commands/MoveRowCommand";
import { useTableEditorStore } from "@/store/tableEditor";

export const useReorderRows = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useDataSourceHistory();

  return (newRows: DataSource["rows"]) => {
    if (!editedItem.value?.dataSource) return;
    const oldRows = editedItem.value.dataSource.rows;
    let fromIndex = -1;
    let toIndex = -1;
    let maxDisplacement = 0;
    for (const [oldIdx, row] of oldRows.entries()) {
      const newIdx = newRows.findIndex(({ id }) => id === row.id);
      const displacement = Math.abs(newIdx - oldIdx);
      if (displacement > maxDisplacement) {
        maxDisplacement = displacement;
        fromIndex = oldIdx;
        toIndex = newIdx;
      }
    }
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const command = new MoveRowCommand(fromIndex, toIndex);
    command.execute(editedItem.value);
    push(command);
  };
};
