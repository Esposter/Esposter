import { readLessIndentedLines } from "#src/services/genshinAssets/kits/gcsim/readLessIndentedLines";

// A `for` header declaring its index, `for i := range table {`, `for i, value := range table {` or `for i := 0; i < n; i++ {`
const LOOP_HEADER_REGEX = /^\s*for\s+(?<index>[A-Za-z]\w*)\s*(?:,\s*\w+\s*)?:=/u;

// The index names of the `for` loops a line sits in, nearest loop first
export const readEnclosingLoopIndices = (lines: readonly string[], lineIndex: number): string[] => {
  const indices: string[] = [];
  for (const line of readLessIndentedLines(lines, lineIndex)) {
    const index = LOOP_HEADER_REGEX.exec(line)?.groups?.index;
    if (index !== undefined) indices.push(index);
  }
  return indices;
};
