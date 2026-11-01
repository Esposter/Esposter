import { countTabs } from "#src/services/genshinAssets/kits/gcsim/countTabs";

// Whether the block a binding is written in is still open at a later line: no line between them, blank lines aside, is
// Less indented than the binding's own
export const checkIsInScope = (lines: readonly string[], bindingLine: number, lineIndex: number): boolean => {
  const indent = countTabs(lines[bindingLine] ?? "");
  for (let position = bindingLine + 1; position <= lineIndex; position++) {
    const line = lines[position] ?? "";
    if (line.trim() !== "" && countTabs(line) < indent) return false;
  }
  return true;
};
