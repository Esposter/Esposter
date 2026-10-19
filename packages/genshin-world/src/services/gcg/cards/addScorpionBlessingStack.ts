import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { SCORPION_BLESSING_ID } from "#src/services/gcg/cards/constants";
import { findScorpionBlessing } from "#src/services/gcg/cards/findScorpionBlessing";
import { scorpionBlessing } from "#src/services/gcg/cards/scorpionBlessing";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// Generates one stack of Scorpion Blessing on a side. The stacks are one card on the side, counted in its counter, which
// Has no limit to how many it holds
export const addScorpionBlessingStack = (side: GcgSideState): void => {
  const blessing = findScorpionBlessing(side);
  if (blessing) blessing.counter += 1;
  else side.onstages.push({ ...createGcgZoneCard(SCORPION_BLESSING_ID, scorpionBlessing), counter: 1 });
};
