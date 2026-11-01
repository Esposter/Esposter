import { splitCells } from "#src/services/genshinParity/reference/splitCells";
import { takeOne } from "@esposter/shared";

// A row of either table, keyed in its first cell by its reference's id, and a layer's by that id and its name after a
// Slash. A line that is not a row has no key
export const readRowKey = (line: string): string | undefined =>
  line.trim().startsWith("|") ? /^`(?<key>[^`]+)`$/u.exec(takeOne(splitCells(line), 0))?.groups?.key : undefined;
