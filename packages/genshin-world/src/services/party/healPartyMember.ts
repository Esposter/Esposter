import type { Party } from "#src/models/party/Party";

import { getPartyMember } from "#src/services/party/getPartyMember";

// Restores a share of a character's Max HP to it, never above all of it. A character that is down stays down, as only
// A revive brings one back
export const healPartyMember = (party: Party, characterId: number, healedHealthShare: number): void => {
  const partyMember = getPartyMember(party, characterId);
  if (partyMember.healthShare === 0) return;
  partyMember.healthShare = Math.min(1, partyMember.healthShare + healedHealthShare);
};
