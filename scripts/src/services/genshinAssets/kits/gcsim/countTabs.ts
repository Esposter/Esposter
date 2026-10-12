// The indent of a line, the whitespace before its first character
export const countTabs = (line: string): number => line.length - line.trimStart().length;
