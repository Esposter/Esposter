// The lines of a text that are not blank, each with its one-based line number, so a record can name where it sits
export const splitNonBlankLines = (text: string): { line: string; lineNumber: number }[] =>
  text.split("\n").flatMap((line, index) => (line.trim() === "" ? [] : [{ line, lineNumber: index + 1 }]));
