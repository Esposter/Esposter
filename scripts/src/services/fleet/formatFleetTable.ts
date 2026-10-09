const COLUMN_GAP = "  ";

// Rows as aligned text, each column as wide as its widest cell, the header row first and underlined
export const formatFleetTable = (header: readonly string[], rows: readonly (readonly string[])[]): string[] => {
  const allRows = [header, ...rows];
  const widths = header.map((_cell, column) => Math.max(...allRows.map((row) => (row[column] ?? "").length)));
  const formatRow = (row: readonly string[]) =>
    row
      .map((cell, column) => cell.padEnd(widths[column] ?? 0))
      .join(COLUMN_GAP)
      .trimEnd();
  const rule = widths.map((width) => "-".repeat(width)).join(COLUMN_GAP);
  return [formatRow(header), rule, ...rows.map((row) => formatRow(row))];
};
