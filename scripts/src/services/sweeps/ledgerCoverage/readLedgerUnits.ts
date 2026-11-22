const UNIT_HEADER_REGEX = /^\|\s*Unit\s*\|/u;
const ROW_REGEX = /^\|(?<unitCell>[^|]*)\|/u;
const SEPARATOR_REGEX = /^\|\s*:?-+:?\s*\|/u;

// The unit cells of a ledger's unit table, the one headed `Unit`, as its rows spell them, backticks and all, in the
// Table's own order. A ledger's rules or findings tables sit above it under other headings, and a text with no unit
// Table holds no units.
export const readLedgerUnits = (text: string): string[] => {
  const lines = text.split("\n");
  const headerIndex = lines.findIndex((line) => UNIT_HEADER_REGEX.test(line));
  if (headerIndex === -1) return [];

  const units: string[] = [];
  for (const line of lines.slice(headerIndex + 1)) {
    if (SEPARATOR_REGEX.test(line)) continue;
    const unitCell = ROW_REGEX.exec(line)?.groups?.unitCell;
    if (unitCell === undefined) break;
    units.push(unitCell.trim());
  }
  return units;
};
