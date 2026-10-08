import type { PartyMember } from "#src/models/party/PartyMember";

// A character as it joins the party: its HP full, no energy, and its skill and burst ready
export const createPartyMember = (): PartyMember => ({
  burstCooldownSeconds: 0,
  energy: 0,
  healthShare: 1,
  skillCooldownSeconds: 0,
});
