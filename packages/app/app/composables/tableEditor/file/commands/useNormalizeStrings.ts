import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { NormalizeStringMode } from "@/models/tableEditor/file/commands/NormalizeStringMode";
import { NormalizeStringsCommand } from "@/models/tableEditor/file/commands/NormalizeStringsCommand";
import { getStringColumnsAffectedCells } from "@/services/tableEditor/file/commands/getStringColumnsAffectedCells";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useNormalizeStrings = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (mode: NormalizeStringMode) => {
    if (!editedItem.value?.dataSource) return;
    const affectedCells = getStringColumnsAffectedCells(editedItem.value.dataSource);
    if (affectedCells.length === 0) return;
    const command = new NormalizeStringsCommand(mode, affectedCells);
    command.execute(editedItem.value);
    push(command);
  };
};
