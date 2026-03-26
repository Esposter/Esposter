import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { NullStrategy } from "@/models/tableEditor/file/commands/NullStrategy";
import { NullStrategyCommand } from "@/models/tableEditor/file/commands/NullStrategyCommand";
import { getNullAffectedCells } from "@/services/tableEditor/file/commands/getNullAffectedCells";
import { getNullAffectedRows } from "@/services/tableEditor/file/commands/getNullAffectedRows";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useNullStrategy = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (strategy: NullStrategy) => {
    if (!editedItem.value?.dataSource) return;
    const affectedCells =
      strategy === NullStrategy.ReplaceWithNA ? getNullAffectedCells(editedItem.value.dataSource) : [];
    const affectedRows = strategy === NullStrategy.DropRow ? getNullAffectedRows(editedItem.value.dataSource) : [];
    if (affectedCells.length === 0 && affectedRows.length === 0) return;
    const command = new NullStrategyCommand(strategy, affectedCells, affectedRows);
    command.execute(editedItem.value);
    push(command);
  };
};
