import { getCommentBridgedLines } from "#src/services/sweeps/duplicateCode/getCommentBridgedLines";
import { takeOne } from "@esposter/shared";

// A declaration opens on a line starting an interface or a type, or on a component's compiler macro (props, emits,
// Model or defaults), and closes where its braces balance. A line binding a composable's call with no arguments, to a
// Name or to a destructure of bare names and aliases, is component wiring, read the same way.
const DECLARATION_START_REGEX =
  /^\s*(?:export\s+)?(?:interface|type)\s|\bdefine(?:Props|Emits|Model)<|\bwithDefaults\(/u;
const COMPOSABLE_CALL_REGEX = /^\s*const (?:\w+|\{ \w+(?:: \w+)?(?:, \w+(?:: \w+)?)* \}) = use\w+\(\);\s*$/u;

// A composable's destructured call, or a props destructure of defineProps, opens on `const {` and closes on the
// `} = useName(...);` or `} = defineProps<...>();` that binds it, and its return opens on `return {`. A block is a
// Declaration only while every line in it is an entry: a bare name or `name: alias,` in a call, and a bare name in a
// Return. A block with a computed value stays code.
interface WiringBlock {
  end: RegExp;
  entry: RegExp;
  start: RegExp;
}

const WIRING_BLOCKS: WiringBlock[] = [
  {
    end: /^\s*\} = (?:use\w+|defineProps<.*>)\(.*\);\s*$/u,
    entry: /^\s*\w+(?:: \w+)?,\s*$/u,
    start: /^\s*const \{\s*$/u,
  },
  { end: /^\s*\};?\s*$/u, entry: /^\s*\w+,\s*$/u, start: /^\s*return \{\s*$/u },
];

const getBraceBalance = (line: string) => line.split("{").length - line.split("}").length;

// The index of the line closing the wiring block opened at `index`, or -1 when no block opens there or a line inside it
// Is not one of its entries
const getWiringBlockEnd = (lines: string[], index: number): number => {
  const block = WIRING_BLOCKS.find(({ start }) => start.test(takeOne(lines, index)));
  if (!block) return -1;
  for (let end = index + 1; end < lines.length; end++) {
    const line = takeOne(lines, end);
    if (block.end.test(line)) return end;
    if (!block.entry.test(line)) return -1;
  }
  return -1;
};

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
