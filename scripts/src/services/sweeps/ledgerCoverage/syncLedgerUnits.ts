import { OPEN_CELL } from "#src/services/sweeps/ledgerCoverage/constants";
import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";
import { readLedgerRowCell, splitLedgerTable } from "#src/services/sweeps/ledgerCoverage/splitLedgerTable";

const CELL_PADDING = " ".length * 2;
// A ledger whose units are the tree's own entries has no row anyone writes: a unit the tree holds and the table
// Does not opens at `—`, a row whose unit the tree no longer holds goes, and every other row keeps its cells.
// Rows come back in name order, since a derived table has no payoff ordering to preserve, and a new row takes the
// Separator's widths so the table stays aligned until the formatter next runs.
export const syncLedgerUnits = (text: string, units: string[]): string => {
  const table = splitLedgerTable(text);
  if (!table) return text;

  const widths = table.separator
    .split("|")
    .slice(1, -1)
    .map(({ length }) => length - CELL_PADDING);
  const rows = new Map(table.body.map((line) => [normalizeLedgerUnit(readLedgerRowCell(line)), line]));
  // The cell is backticked, and the backtick sorts after a hyphen — so the order is the bare name's, where a
  // Name precedes its own prefix-extensions the way a directory listing reads
  const synced = units
    .map((unit) => ({ key: normalizeLedgerUnit(unit), unit }))
    .toSorted((firstEntry, secondEntry) => (firstEntry.key < secondEntry.key ? -1 : 1))
    .map(({ key, unit }) => {
      const row = rows.get(key);
      if (row) return row;
      const cells = [unit, OPEN_CELL, ...widths.slice(2).map(() => "")];
      return `| ${cells.map((cell, index) => cell.padEnd(widths[index] ?? 0)).join(" | ")} |`;
    });
  return [...table.head, ...synced, ...table.tail].join("\n");
};
