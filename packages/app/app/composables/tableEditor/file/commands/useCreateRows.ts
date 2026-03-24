import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { CreateRowsCommand } from "@/models/tableEditor/file/commands/CreateRowsCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useCreateRows = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (rows: DataSource["rows"]) => {
    if (!editedItem.value?.dataSource || rows.length === 0) return;
    const startIndex = editedItem.value.dataSource.rows.length;
    const command = new CreateRowsCommand(startIndex, rows);
    command.execute(editedItem.value);
    push(command);
  };
};
