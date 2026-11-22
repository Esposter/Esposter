import type { Reaction } from "#src/models/combat/Reaction";
import type { Party } from "#src/models/party/Party";

import { advanceElementalState } from "#src/services/combat/aura/advanceElementalState";

// The reactions a member's seconds bring, which this step does not read: one buffer every advance pushes onto and the
// Step clears after each member, so a step allocates nothing per member or per frame
const reactions: Reaction[] = [];

// Moves every member's elemental state on by the step's seconds, its auras decaying by their gauge as an enemy's do
export const stepPartyElementalStates = (party: Party, stepSeconds: number): void => {
  for (const { elementalState } of party.characterIdMemberMap.values()) {
    advanceElementalState(elementalState, stepSeconds, reactions);
    reactions.length = 0;
  }
};
