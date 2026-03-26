import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { CreateRowsCommand } from "@/models/tableEditor/file/commands/CreateRowsCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useCreateRows = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (rows: Row[]) => {
    if (!editedItem.value?.dataSource || rows.length === 0) return;
    const startIndex = editedItem.value.dataSource.rows.length;
    const command = new CreateRowsCommand(startIndex, rows);
    command.execute(editedItem.value);
    push(command);
  };
};
