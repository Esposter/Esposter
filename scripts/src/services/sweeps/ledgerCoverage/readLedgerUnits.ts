const ROW_REGEX = /^\|(?<unitCell>[^|]*)\|/u;
const SEPARATOR_REGEX = /^\|\s*-+\s*\|/u;

// The unit cells of a ledger's table as its rows spell them, backticks and all, in the table's own order. A text
// With no table holds no units.
export const readLedgerUnits = (text: string): string[] => {
  const lines = text.split("\n");
  const separatorIndex = lines.findIndex((line) => SEPARATOR_REGEX.test(line));
  if (separatorIndex === -1) return [];

  const bodyEnd = lines.findIndex((line, index) => index > separatorIndex && !ROW_REGEX.test(line));
  return lines
    .slice(separatorIndex + 1, bodyEnd === -1 ? undefined : bodyEnd)
    .map((line) => (ROW_REGEX.exec(line)?.groups?.unitCell ?? "").trim());
};
