import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { createNightsoulBlessingStart } from "#src/services/kit/createNightsoulBlessingStart";

export const MUALANI_CHARACTER_ID = 10_000_102;

// Her Nightsoul points are set to 60 as her blessing is entered, and her blessing drains ten a second, as gcsim (MIT)
// Mualani's skill.go reduceNightsoulPoints does
const NIGHTSOUL_POINTS = 60;
const NIGHTSOUL_DRAIN_PER_SECOND = 10;

// Mualani's behaviour: her skill's press enters the Nightsoul Blessing with its points, which drain ten a second, or leaves
// It when she is in it, as gcsim's Skill does. Not built: the blessing's Sharky's Bite, so the press has no hit, and its
// Cooldown, which runs from the press where gcsim runs it from the blessing's end, and the cooldown her leaving sets, which
// The kit does not hold. Her strikes, charged attack and plunges are her record's alone, and she has no plunge in gcsim, so
// Each plunge hits as its action starts
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mualani
// Constellation 1 needs the first Surfing Bite of the Nightsoul's Blessing, which the kit does not build
// Constellation 2 needs the Wave Momentum stacks and Puffers, which the kit does not build
// Constellation 4 needs Puffers and the Energy they restore, which the kit does not build
// Constellation 6 needs Constellation 1's increase, which the kit does not build
export const createMualaniKitBehaviour = (): KitBehaviour => ({
  skill: { onStart: createNightsoulBlessingStart(NIGHTSOUL_POINTS, NIGHTSOUL_DRAIN_PER_SECOND) },
});
