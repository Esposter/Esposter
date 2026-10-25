import { getBraceBalance } from "#src/services/sweeps/duplicateCode/getBraceBalance";
import { getCommentBridgedLines } from "#src/services/sweeps/duplicateCode/getCommentBridgedLines";
import { getWiringBlockEnd } from "#src/services/sweeps/duplicateCode/getWiringBlockEnd";
import { takeOne } from "@esposter/shared";

// A declaration opens on a line starting an interface or a type, or on a component's compiler macro (props, emits,
// Model or defaults), and closes where its braces balance. A line binding a composable's call with no arguments, to a
// Name or to a destructure of bare names and aliases, is component wiring, read the same way.
const DECLARATION_START_REGEX =
  /^\s*(?:export\s+)?(?:interface|type)\s|\bdefine(?:Props|Emits|Model)<|\bwithDefaults\(/u;
const COMPOSABLE_CALL_REGEX = /^\s*const (?:\w+|\{ \w+(?:: \w+)?(?:, \w+(?:: \w+)?)* \}) = use\w+\(\);\s*$/u;

// The 1-based lines of a file that belong to a declaration or to component wiring, so a copy of only those is a
// Component's preamble rather than logic.
export const getDeclarationLines = (text: string): Set<number> => {
  const lines = text.split("\n");
  const declarationLines = new Set<number>();
  let index = 0;
  while (index < lines.length) {
    const wiringBlockEnd = getWiringBlockEnd(lines, index);
    if (wiringBlockEnd !== -1) {
      for (; index <= wiringBlockEnd; index++) declarationLines.add(index + 1);
      continue;
    }
    const line = takeOne(lines, index);
    if (!DECLARATION_START_REGEX.test(line) && !COMPOSABLE_CALL_REGEX.test(line)) {
      index++;
      continue;
    }
    let depth = 0;
    do {
      depth += getBraceBalance(takeOne(lines, index));
      declarationLines.add(index + 1);
      index++;
    } while (depth > 0 && index < lines.length);
  }
  return getCommentBridgedLines(text, declarationLines);
};
