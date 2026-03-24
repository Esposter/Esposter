import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { FindReplaceCommand } from "@/models/tableEditor/file/commands/FindReplaceCommand";
import { findMatchingCells } from "@/services/tableEditor/file/commands/findMatchingCells";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useFindReplace = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (findValue: string, replaceValue: string, specificCell?: { columnName: string; rowIndex: number }) => {
    if (!editedItem.value?.dataSource || !findValue || findValue === replaceValue) return;
    const affectedCells = findMatchingCells(editedItem.value.dataSource, findValue, specificCell);
    if (affectedCells.length === 0) return;
    const command = new FindReplaceCommand(findValue, replaceValue, affectedCells);
    command.execute(editedItem.value);
    push(command);
  };
};
