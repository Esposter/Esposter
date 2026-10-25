import type { GcsimTableCite } from "#src/models/genshinAssets/kits/gcsim/GcsimTableCite";

import { readGcsimTableRows } from "#src/services/genshinAssets/kits/gcsim/readGcsimTableRows";
import { readIndex } from "#src/services/genshinAssets/kits/gcsim/readIndex";

// A table index `name[i]` or `name[i][k]` in a line, where `i` and `k` are literals or the action's hit counter, which
// The caller gives as the action's own number, as `c.NormalCounter` is that for a normal attack
const TABLE_INDEX_REGEX = /(?<name>[A-Za-z_]\w*)\[(?<index>[^\]]+)\](?:\[(?<cell>[^\]]+)\])?/gu;

// The line with each module table index in it replaced by the cell it reads, each cited by the line of its row. A table
// Index that is neither a literal nor the counter, or a row or cell it does not have, is not evaluable and gives none,
// So nothing is guessed. A name no table declares is left in the line as it is
export const substituteGoTableCells = (
  text: string,
  lines: readonly string[],
  counter: number | undefined,
): undefined | { cites: GcsimTableCite[]; text: string } => {
  const cites: GcsimTableCite[] = [];
  let isEvaluable = true;
  const substituted = text.replaceAll(
    TABLE_INDEX_REGEX,
    (match, name: string, indexText: string, cellText?: string) => {
      if (!isEvaluable) return match;
      const rows = readGcsimTableRows(lines, name);
      if (rows === undefined) return match;
      const rowIndex = readIndex(indexText, counter);
      const row = rowIndex === undefined ? undefined : rows[rowIndex];
      // A one-dimensional table's index is its row, and a two-dimensional one's cell is the index after its row
      const cellIndex = cellText === undefined ? 0 : readIndex(cellText, counter);
      const cell = cellIndex === undefined ? undefined : row?.cells[cellIndex];
      const value = cell === undefined ? undefined : Number(cell);
      if (row === undefined || value === undefined || !Number.isFinite(value)) {
        isEvaluable = false;
        return match;
      }
      cites.push({ line: row.line, value });
      return cell ?? match;
    },
  );
  return isEvaluable ? { cites, text: substituted } : undefined;
};
