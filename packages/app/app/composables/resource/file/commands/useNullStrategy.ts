import { NullStrategy } from "@/models/resource/file/commands/NullStrategy";
import { NullStrategyCommand } from "@/models/resource/file/commands/NullStrategyCommand";
import { getNullAffectedCells } from "@/services/resource/file/commands/getNullAffectedCells";
import { getNullAffectedRows } from "@/services/resource/file/commands/getNullAffectedRows";

export const useNullStrategy = () =>
  useFileCommand((dataSource, strategy: NullStrategy) => {
    const affectedCells = strategy === NullStrategy.ReplaceWithNA ? getNullAffectedCells(dataSource) : [];
    const affectedRows = strategy === NullStrategy.DropRow ? getNullAffectedRows(dataSource) : [];
    if (affectedCells.length === 0 && affectedRows.length === 0) return undefined;
    return new NullStrategyCommand(strategy, affectedCells, affectedRows);
  });
