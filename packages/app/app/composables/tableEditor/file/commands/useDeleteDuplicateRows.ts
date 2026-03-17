import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { KeepDuplicateMode } from "@/models/tableEditor/file/KeepDuplicateMode";
import { DeleteRowsCommand } from "@/models/tableEditor/file/commands/DeleteRowsCommand";
import { findDuplicateRows } from "@/services/tableEditor/file/commands/findDuplicateRows";
import { useTableEditorStore } from "@/store/tableEditor";
import { storeToRefs } from "pinia";

export const useDeleteDuplicateRows = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { push } = useDataSourceHistory();

  return (keepMode = KeepDuplicateMode.First) => {
    if (!editedItem.value?.dataSource) return;
    const duplicateRows = findDuplicateRows(editedItem.value.dataSource, keepMode);
    if (duplicateRows.length === 0) return;
    const command = new DeleteRowsCommand(duplicateRows);
    command.execute(editedItem.value);
    push(command);
  };
};
