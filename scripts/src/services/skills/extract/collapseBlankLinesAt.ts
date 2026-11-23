import { checkIsBlankText } from "@esposter/shared";

// Collapses the run of blank lines around `index` to one — only where a splice joined two blocks, so a run inside
// Content the move never touched, such as a fenced example, is left as written
export const collapseBlankLinesAt = (lines: string[], index: number): string[] => {
  let first = index;
  while (first > 0 && checkIsBlankText(lines[first - 1])) first--;
  let last = index;
  while (last < lines.length && checkIsBlankText(lines[last])) last++;
  return last - first > 1 ? [...lines.slice(0, first + 1), ...lines.slice(last)] : lines;
};
