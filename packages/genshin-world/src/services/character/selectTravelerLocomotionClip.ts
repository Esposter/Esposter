import type { LocomotionState } from "genshin-engine";

import { TRAVELER_LOCOMOTION_CLIPS } from "#src/services/character/constants";

// The clip the Traveler's model plays in a body state: its standing cycle while still, its walk, run or sprint cycle as
// It moves. A state with no clip of those four gives the empty name, which plays none
export const selectTravelerLocomotionClip = (state: LocomotionState): string => TRAVELER_LOCOMOTION_CLIPS[state] ?? "";
