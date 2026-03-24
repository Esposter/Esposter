import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { DeleteRowsCommand } from "@/models/tableEditor/file/commands/DeleteRowsCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne, toRawDeep } from "@esposter/shared";

interface IndexedRow {
  index: number;
  row: DataSource["rows"][number];
}

export const useDeleteRows = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (ids: string[]) => {
    if (!editedItem.value?.dataSource) return;
    const dataSource = editedItem.value.dataSource;
    const indexedRows: IndexedRow[] = [];
    for (const id of ids) {
      const index = dataSource.rows.findIndex((row) => row.id === id);
      if (index === -1) continue;
      indexedRows.push({ index, row: structuredClone(toRawDeep(takeOne(dataSource.rows, index))) });
    }
    if (indexedRows.length === 0) return;
    const command = new DeleteRowsCommand(indexedRows);
    command.execute(editedItem.value);
    push(command);
  };
};
