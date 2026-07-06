import { FindReplaceCommand } from "@/models/tableEditor/file/commands/FindReplaceCommand";
import { findMatchingCells } from "@/services/tableEditor/file/commands/findMatchingCells";

export const useFindReplace = () =>
  useTableEditorCommand(
    (editedItem, findValue: string, replaceValue: string, specificCell?: { columnName: string; rowIndex: number }) => {
      if (!findValue || findValue === replaceValue) return undefined;
      const affectedCells = findMatchingCells(editedItem.dataSource, findValue, specificCell);
      if (affectedCells.length === 0) return undefined;
      return new FindReplaceCommand(findValue, replaceValue, affectedCells);
    },
  );
