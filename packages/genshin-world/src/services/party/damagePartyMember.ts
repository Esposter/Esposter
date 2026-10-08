import type { Party } from "#src/models/party/Party";

import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Takes a share of a character's Max HP from it, never below none. A character whose HP runs out is down and loses its
// Energy, and if it was on the field, the next member of the deployed team standing after it takes the field, as the
// Game brings the next character on. A character already down takes nothing
export const damagePartyMember = (party: Party, characterId: number, lostHealthShare: number): void => {
  const partyMember = getPartyMember(party, characterId);
  if (partyMember.healthShare === 0) return;
  partyMember.healthShare = Math.max(0, partyMember.healthShare - lostHealthShare);
  if (partyMember.healthShare > 0) return;
  partyMember.energy = 0;
  const characterIds = party.teams[party.deployedTeamIndex]?.characterIds ?? [];
  if (characterIds[party.activeIndex] !== characterId) return;
  for (let offset = 1; offset < characterIds.length; offset++) {
    const index = (party.activeIndex + offset) % characterIds.length;
    const nextCharacterId = characterIds[index];
    if (nextCharacterId === undefined || checkIsCharacterDown(party, nextCharacterId)) continue;
    party.activeIndex = index;
    return;
  }
};
