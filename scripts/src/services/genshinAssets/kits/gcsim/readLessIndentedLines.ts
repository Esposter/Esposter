import { countTabs } from "#src/services/genshinAssets/kits/gcsim/countTabs";

// The lines above a line, nearest first, each less indented than the one below it, so the blocks a line sits in are met from
// The inside out. Blank lines and lines as indented as the current one or more are skipped
export const readLessIndentedLines = function* (lines: readonly string[], lineIndex: number): Generator<string> {
  let indent = countTabs(lines[lineIndex] ?? "");
  for (let position = lineIndex - 1; position >= 0; position--) {
    const line = lines[position] ?? "";
    if (line.trim() === "" || countTabs(line) >= indent) continue;
    indent = countTabs(line);
    yield line;
  }
};
