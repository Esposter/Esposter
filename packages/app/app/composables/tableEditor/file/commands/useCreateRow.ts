import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { CreateRowCommand } from "@/models/tableEditor/file/commands/CreateRowCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useCreateRow = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
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
