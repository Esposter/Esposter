import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

export interface GcsimLoop {
  count: number;
  index: string;
}

const RANGE_HEADER_REGEX = /^\s*for\s+(?<index>\w+)\s*:=\s*range\s+(?<bound>.+?)\s*\{\s*$/u;
const COUNTING_HEADER_REGEX =
  /^\s*for\s+(?<index>\w+)\s*:=\s*0\s*;\s*\k<index>\s*<\s*(?<bound>.+?)\s*;\s*\k<index>\s*\+\+\s*\{\s*$/u;

const countTabs = (line: string): number => line.length - line.trimStart().length;

// The count an expression of a loop's bound evaluates to, a whole number from zero, or none where the bound is not one
const readLoopCount = (bound: string, resolveName: (name: string) => GoValue | undefined): number | undefined => {
  const tokens = tokenizeGo(bound);
  const { expression } = parseGoExpression(tokens, 0);
  const value: GoValue | undefined = evaluateGoExpression(expression, resolveName);
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : undefined;
};

// The `for` loop a line sits in, found by scanning up to the nearest block opener above it, where the loop's header is a
// Range over a whole count or a counting loop from zero. A less indented line that opens no block is the start of a
// Statement the line continues across lines, so the scan goes on from its indent. A line in no loop, or in a block that is
// Not one, has none
export const readGcsimEnclosingLoop = (
  lines: readonly string[],
  lineIndex: number,
  resolveName: (name: string) => GoValue | undefined,
): GcsimLoop | undefined => {
  let indent = countTabs(lines[lineIndex] ?? "");
  for (let position = lineIndex - 1; position >= 0; position--) {
    const line = lines[position] ?? "";
    if (line.trim() === "" || countTabs(line) >= indent) continue;
    if (!line.trimEnd().endsWith("{")) {
      indent = countTabs(line);
      continue;
    }
    const header = RANGE_HEADER_REGEX.exec(line) ?? COUNTING_HEADER_REGEX.exec(line);
    if (header === null) return undefined;
    const count = readLoopCount(header.groups?.bound ?? "", resolveName);
    return count === undefined ? undefined : { count, index: header.groups?.index ?? "" };
  }
  return undefined;
};
