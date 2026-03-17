import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { CreateRowsCommand } from "@/models/tableEditor/file/commands/CreateRowsCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { storeToRefs } from "pinia";

export const useCreateRows = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useDataSourceHistory();

  return (rows: DataSource["rows"]) => {
    if (!editedItem.value?.dataSource || rows.length === 0) return;
    const startIndex = editedItem.value.dataSource.rows.length;
    const command = new CreateRowsCommand(startIndex, rows);
    command.execute(editedItem.value);
    push(command);
  };
};
