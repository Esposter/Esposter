import type { Party } from "#src/models/party/Party";

import { getPartyMember } from "#src/services/party/getPartyMember";

// Grants a character a Bond of Life worth a share of its Max HP, added to any Bond of Life it already carries (provisional:
// The wiki's stacking examples, Clorinde's and Sigewinne's, read as additive)
export const grantPartyMemberBondOfLife = (party: Party, characterId: number, bondOfLifeShare: number): void => {
  const partyMember = getPartyMember(party, characterId);
  if (!partyMember.bondOfLifeShare) partyMember.bondOfLifeClearedShare = 0;
  partyMember.bondOfLifeShare = (partyMember.bondOfLifeShare ?? 0) + bondOfLifeShare;
};
