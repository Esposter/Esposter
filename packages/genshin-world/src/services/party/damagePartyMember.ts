import type { Party } from "#src/models/party/Party";

import { PARTY_FALL_SECONDS } from "#src/services/party/constants";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Takes a share of a character's Max HP from it, never below none, and records the change for the kits with the character
// Whose kit took it as its source, none for an enemy's strike. A character whose HP runs out is down and loses its
// Energy, and if it was on the field, its fall starts, after which the player is asked for the next member standing.
// A character already down takes nothing
export const damagePartyMember = (
  party: Party,
  characterId: number,
  lostHealthShare: number,
  sourceCharacterId?: number,
): void => {
  const partyMember = getPartyMember(party, characterId);
  if (partyMember.healthShare === 0 || lostHealthShare <= 0) return;
  const previousHealthShare = partyMember.healthShare;
  partyMember.healthShare = Math.max(0, previousHealthShare - lostHealthShare);
  party.healthChanges.push({
    bondOfLifeShare: 0,
    characterId,
    healthShare: partyMember.healthShare - previousHealthShare,
    overflowHealthShare: 0,
    ...(sourceCharacterId === undefined ? {} : { sourceCharacterId }),
  });
  if (partyMember.healthShare > 0) return;
  partyMember.energy = 0;
  if (getDeployedCharacterIds(party)[party.activeIndex] === characterId)
    party.fallSecondsRemaining = PARTY_FALL_SECONDS;
};
