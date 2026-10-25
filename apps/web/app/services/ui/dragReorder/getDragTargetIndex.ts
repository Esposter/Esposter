import { takeOne } from "@esposter/shared";

// The slot nearest where the row is held, so rows of any height change places once, midway
export const getDragTargetIndex = (offsets: number[], translate: number) => {
  let targetIndex = 0;
  for (const [index, offset] of offsets.entries())
    if (Math.abs(translate - offset) < Math.abs(translate - takeOne(offsets, targetIndex))) targetIndex = index;
  return targetIndex;
};
