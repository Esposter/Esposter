import { OPEN_CELL } from "#src/services/sweeps/ledgerCoverage/constants";

const ROW_REGEX = /^\|(?<unitCell>[^|]*)\|/u;
const SEPARATOR_REGEX = /^\|\s*-+\s*\|/u;
const CELL_PADDING = " ".length * 2;
// The cell is backticked, and the backtick sorts after a hyphen — so the order is the bare name's, where a
// Name precedes its own prefix-extensions the way a directory listing reads
const getSortKey = (unit: string): string => unit.replaceAll("`", "");
// A ledger whose units are the tree's own entries has no row anyone writes: a unit the tree holds and the table
// Does not opens at `—`, a row whose unit the tree no longer holds goes, and every other row keeps its cells.
// Rows come back in name order, since a derived table has no payoff ordering to preserve, and a new row takes the
// Separator's widths so the table stays aligned until the formatter next runs.
export const syncLedgerUnits = (text: string, units: string[]): string => {
  const lines = text.split("\n");
  const separatorIndex = lines.findIndex((line) => SEPARATOR_REGEX.test(line));
  if (separatorIndex === -1) return text;

  const widths = (lines[separatorIndex] ?? "")
    .split("|")
    .slice(1, -1)
    .map(({ length }) => length - CELL_PADDING);
  const bodyEnd = lines.findIndex((line, index) => index > separatorIndex && !ROW_REGEX.test(line));
  const body = lines.slice(separatorIndex + 1, bodyEnd === -1 ? undefined : bodyEnd);
  const rows = new Map(body.map((line) => [(ROW_REGEX.exec(line)?.groups?.unitCell ?? "").trim(), line]));
  const synced = units
    .toSorted((first, second) => (getSortKey(first) < getSortKey(second) ? -1 : 1))
    .map((unit) => {
      const row = rows.get(unit);
      if (row) return row;
      const cells = [unit, OPEN_CELL, ...widths.slice(2).map(() => "")];
      return `| ${cells.map((cell, index) => cell.padEnd(widths[index] ?? 0)).join(" | ")} |`;
    });
  return [...lines.slice(0, separatorIndex + 1), ...synced, ...(bodyEnd === -1 ? [] : lines.slice(bodyEnd))].join("\n");
};
