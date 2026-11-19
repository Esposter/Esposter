const ROW_REGEX = /^\|(?<unitCell>[^|]*)\|/u;
const SEPARATOR_REGEX = /^\|\s*-+\s*\|/u;

// A ledger's table cut where its rows sit: the head through the separator, the body of rows, and the tail past them.
// The text with no table has none to cut, so it yields null.
export const splitLedgerTable = (text: string) => {
  const lines = text.split("\n");
  const separatorIndex = lines.findIndex((line) => SEPARATOR_REGEX.test(line));
  if (separatorIndex === -1) return null;

  const bodyEnd = lines.findIndex((line, index) => index > separatorIndex && !ROW_REGEX.test(line));
  const end = bodyEnd === -1 ? lines.length : bodyEnd;
  return {
    body: lines.slice(separatorIndex + 1, end),
    head: lines.slice(0, separatorIndex + 1),
    separator: lines[separatorIndex] ?? "",
    tail: lines.slice(end),
  };
};

// The unit cell of a table row as the row spells it, backticks and padding included.
export const readLedgerRowCell = (line: string): string => ROW_REGEX.exec(line)?.groups?.unitCell ?? "";
