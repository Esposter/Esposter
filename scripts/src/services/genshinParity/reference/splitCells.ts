// A row's cells: the text between its outer pipes, split on the pipes a cell does not escape, each cell trimmed, so the
// Formatter's padding never changes what a cell holds
export const splitCells = (line: string): string[] =>
  line
    .trim()
    .replaceAll(/^\||\|$/gu, "")
    .split(/(?<!\\)\|/u)
    .map((cell) => cell.trim());
