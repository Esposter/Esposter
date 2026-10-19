import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { findScorpionBlessing } from "#src/services/gcg/cards/findScorpionBlessing";

// Spends the stacks of Scorpion Blessing a side holds, leaving the card with none, which takes it off the field
export const spendScorpionBlessingStacks = (side: GcgSideState): void => {
  const blessing = findScorpionBlessing(side);
  if (blessing) blessing.counter = 0;
};
