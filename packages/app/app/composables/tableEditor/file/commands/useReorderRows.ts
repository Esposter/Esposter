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
    const movedRow = newRows.find((row, index) => row.id !== oldRows[index]?.id);
    if (!movedRow) return;
    const fromIndex = oldRows.findIndex(({ id }) => id === movedRow.id);
    const toIndex = newRows.findIndex(({ id }) => id === movedRow.id);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const command = new MoveRowCommand(fromIndex, toIndex);
    command.execute(editedItem.value);
    push(command);
  };
};
