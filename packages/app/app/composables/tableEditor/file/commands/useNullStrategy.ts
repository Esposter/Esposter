import { NullStrategy } from "@/models/tableEditor/file/commands/NullStrategy";
import { NullStrategyCommand } from "@/models/tableEditor/file/commands/NullStrategyCommand";
import { getNullAffectedCells } from "@/services/tableEditor/file/commands/getNullAffectedCells";
import { getNullAffectedRows } from "@/services/tableEditor/file/commands/getNullAffectedRows";

export const useNullStrategy = () =>
  useTableEditorCommand((editedItem, strategy: NullStrategy) => {
    const affectedCells = strategy === NullStrategy.ReplaceWithNA ? getNullAffectedCells(editedItem.dataSource) : [];
    const affectedRows = strategy === NullStrategy.DropRow ? getNullAffectedRows(editedItem.dataSource) : [];
    if (affectedCells.length === 0 && affectedRows.length === 0) return undefined;
    return new NullStrategyCommand(strategy, affectedCells, affectedRows);
  });
