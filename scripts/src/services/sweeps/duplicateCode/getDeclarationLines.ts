import { takeOne } from "@esposter/shared";

// A declaration opens on a line starting an interface or a type, or on a component's props, emits or model, and closes where
// Its braces balance. A line binding a composable's call with no arguments is component wiring, read the same way.
const DECLARATION_START_REGEX = /^\s*(?:export\s+)?(?:interface|type)\s|\bdefine(?:Props|Emits|Model)</u;
const COMPOSABLE_CALL_REGEX = /^\s*const \w+ = use\w+\(\);\s*$/u;

const getBraceBalance = (line: string) => line.split("{").length - line.split("}").length;

// The 1-based lines of a file that belong to a declaration or to component wiring, so a copy of only those is a
// Component's preamble rather than logic.
export const getDeclarationLines = (text: string): Set<number> => {
  const lines = text.split("\n");
  const declarationLines = new Set<number>();
  let index = 0;
  while (index < lines.length) {
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
  return declarationLines;
};
