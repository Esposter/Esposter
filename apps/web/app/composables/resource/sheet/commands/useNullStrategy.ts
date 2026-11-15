import { NullStrategy } from "#src/models/resource/sheet/commands/NullStrategy";
import { NullStrategyCommand } from "#src/models/resource/sheet/commands/NullStrategyCommand";
import { getNullAffectedCells } from "#src/services/resource/sheet/commands/getNullAffectedCells";
import { getNullAffectedRows } from "#src/services/resource/sheet/commands/getNullAffectedRows";

export const useNullStrategy = () =>
  useSheetCommand((dataSource, strategy: NullStrategy) => {
    const affectedCells = strategy === NullStrategy.ReplaceWithNA ? getNullAffectedCells(dataSource) : [];
    const affectedRows = strategy === NullStrategy.DropRow ? getNullAffectedRows(dataSource) : [];
    if (affectedCells.length === 0 && affectedRows.length === 0) return undefined;
    else return new NullStrategyCommand(strategy, affectedCells, affectedRows);
  });
