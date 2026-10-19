import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { findScorpionBlessing } from "#src/services/gcg/cards/findScorpionBlessing";

// The stacks of Scorpion Blessing a side holds, which its Technique adds 1 DMG for each of
export const readScorpionBlessingStacks = (side: GcgSideState): number => findScorpionBlessing(side)?.counter ?? 0;
