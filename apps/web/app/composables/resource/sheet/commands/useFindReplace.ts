import { FindReplaceCommand } from "@/models/resource/sheet/commands/FindReplaceCommand";
import { findMatchingCells } from "@/services/resource/sheet/commands/findMatchingCells";

export const useFindReplace = () =>
  useSheetCommand(
    (dataSource, findValue: string, replaceValue: string, specificCell?: { columnName: string; rowIndex: number }) => {
      if (!findValue || findValue === replaceValue) return undefined;
      const affectedCells = findMatchingCells(dataSource, findValue, specificCell);
      if (affectedCells.length === 0) return undefined;
      return new FindReplaceCommand(findValue, replaceValue, affectedCells);
    },
  );
