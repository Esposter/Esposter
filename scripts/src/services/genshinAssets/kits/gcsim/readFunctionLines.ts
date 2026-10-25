// The first and last line of the top-level function a line is in, or undefined where it is in none
export const readFunctionLines = (lines: readonly string[], lineIndex: number): [number, number] | undefined => {
  let start = lineIndex;
  while (start >= 0 && !(lines[start] ?? "").startsWith("func ")) start--;
  if (start < 0) return undefined;
  let end = lineIndex;
  while (end < lines.length && !(lines[end] ?? "").startsWith("}")) end++;
  return [start, end];
};
