import type { PartyMember } from "#src/models/party/PartyMember";

import { createElementalState } from "#src/services/combat/aura/createElementalState";

// A character as it joins the party: its HP full, no energy, and its skill and burst ready
export const createPartyMember = (): PartyMember => ({
  burstCooldownSeconds: 0,
  elementalState: createElementalState(),
  energy: 0,
  healthShare: 1,
  skillCooldownSeconds: 0,
});
