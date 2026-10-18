import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

export const SCORPION_BLESSING_ID = 123_032;

const findScorpionBlessing = (side: GcgSideState) =>
  side.onstages.find(({ cardId }) => cardId === SCORPION_BLESSING_ID);

// Generates one stack of Scorpion Blessing on a side. The stacks are one card on the side, counted in its counter, which
// Has no limit to how many it holds
export const addScorpionBlessingStack = (side: GcgSideState): void => {
  const blessing = findScorpionBlessing(side);
  if (blessing) blessing.counter += 1;
  else side.onstages.push({ ...createGcgZoneCard(SCORPION_BLESSING_ID, scorpionBlessing), counter: 1 });
};

// The stacks of Scorpion Blessing a side holds, which its Technique adds 1 DMG for each of
export const readScorpionBlessingStacks = (side: GcgSideState): number => findScorpionBlessing(side)?.counter ?? 0;

// Spends the stacks of Scorpion Blessing a side holds, leaving the card with none, which takes it off the field
export const spendScorpionBlessingStacks = (side: GcgSideState): void => {
  const blessing = findScorpionBlessing(side);
  if (blessing) blessing.counter = 0;
};

// Scorpion Blessing: the stacks a Technique of Spirit of Omen: Pyro Scorpion spends, each adding 1 DMG to it
export const scorpionBlessing: GcgCardModule = { isSpent: (_side, zoneCard) => zoneCard.counter <= 0 };
