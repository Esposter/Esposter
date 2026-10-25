import { WIRING_BLOCKS } from "#src/services/sweeps/duplicateCode/constants";
import { takeOne } from "@esposter/shared";

// The index of the line closing the wiring block opened at `index`, or -1 when no block opens there or a line inside it
// Is not one of its entries
export const getWiringBlockEnd = (lines: string[], index: number): number => {
  const block = WIRING_BLOCKS.find(({ start }) => start.test(takeOne(lines, index)));
  if (!block) return -1;
  for (let end = index + 1; end < lines.length; end++) {
    const line = takeOne(lines, end);
    if (block.end.test(line)) return end;
    if (!block.entry.test(line)) return -1;
  }
  return -1;
};
