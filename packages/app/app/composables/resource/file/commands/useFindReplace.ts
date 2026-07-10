import { FindReplaceCommand } from "@/models/resource/file/commands/FindReplaceCommand";
import { findMatchingCells } from "@/services/resource/file/commands/findMatchingCells";

export const useFindReplace = () =>
  useFileCommand(
    (dataSource, findValue: string, replaceValue: string, specificCell?: { columnName: string; rowIndex: number }) => {
      if (!findValue || findValue === replaceValue) return undefined;
      const affectedCells = findMatchingCells(dataSource, findValue, specificCell);
      if (affectedCells.length === 0) return undefined;
      return new FindReplaceCommand(findValue, replaceValue, affectedCells);
    },
  );
