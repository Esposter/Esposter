import type { Party } from "#src/models/party/Party";

import { advanceElementalState } from "#src/services/combat/aura/advanceElementalState";

// Moves every member's elemental state on by the step's seconds, its auras decaying by their gauge as an enemy's do
export const stepPartyElementalStates = (party: Party, stepSeconds: number): void => {
  for (const { elementalState } of party.characterIdMemberMap.values())
    advanceElementalState(elementalState, stepSeconds, []);
};
