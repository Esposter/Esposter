import type { AffectedCell } from "#src/models/resource/sheet/commands/AffectedCell";

import { FindReplaceCommand } from "#src/models/resource/sheet/commands/FindReplaceCommand";
import { findMatchingCells } from "#src/services/resource/sheet/commands/findMatchingCells";

export const useFindReplace = () =>
  useSheetCommand(
    (
      dataSource,
      findValue: string,
      replaceValue: string,
      specificCell?: Pick<AffectedCell, "columnName" | "rowIndex">,
    ) => {
      if (!findValue || findValue === replaceValue) return undefined;
      const affectedCells = findMatchingCells(dataSource, findValue, specificCell);
      if (affectedCells.length === 0) return undefined;
      else return new FindReplaceCommand(findValue, replaceValue, affectedCells);
    },
  );
