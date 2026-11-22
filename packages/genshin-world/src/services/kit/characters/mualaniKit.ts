import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { createNightsoulBlessingStart } from "#src/services/kit/createNightsoulBlessingStart";

export const MUALANI_CHARACTER_ID = 10_000_102;

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
// Her Nightsoul points are set as her blessing is entered, and its points drain at the record's rate, as gcsim (MIT)
// Mualani's skill.go reduceNightsoulPoints does
export const createMualaniKitBehaviour = ({ readParameter }: KitRecordReader): KitBehaviour => ({
  skill: {
    onStart: createNightsoulBlessingStart(readParameter("nightsoulPoints"), readParameter("nightsoulDrainPerSecond")),
  },
});
