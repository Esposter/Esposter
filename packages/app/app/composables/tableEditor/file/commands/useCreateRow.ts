import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { Row } from "#shared/models/tableEditor/file/Row";
import { CreateRowCommand } from "@/models/tableEditor/file/commands/CreateRowCommand";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { useTableEditorStore } from "@/store/tableEditor";

export const useCreateRow = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useFileHistoryStore();
  return (newRow?: Row) => {
    if (!editedItem.value?.dataSource) return;
    const createdRow = new Row({
      data:
        newRow?.data ?? Object.fromEntries(editedItem.value.dataSource.columns.map((column) => [column.name, null])),
    });
    const index = editedItem.value.dataSource.rows.length;
    const command = new CreateRowCommand(index, createdRow);
    command.execute(editedItem.value);
    push(command);
  };
};
