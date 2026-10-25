export const trimBlankLines = (lines: string[]): string[] => {
  const first = lines.findIndex((line) => line.trim() !== "");
  const last = lines.findLastIndex((line) => line.trim() !== "");
  return first === -1 ? [] : lines.slice(first, last + 1);
};
