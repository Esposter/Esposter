import type { FallRefusal } from "#src/models/party/FallRefusal";
import type { Party } from "#src/models/party/Party";

import { PARTY_FALL_SECONDS } from "#src/services/party/constants";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Takes a share of a character's Max HP from it, never below none, and records the change for the kits with the character
// Whose kit took it as its source, none for an enemy's strike. A character whose HP runs out is down and loses its
// Energy, and if it was on the field, its fall starts, after which the player is asked for the next member standing.
// Where a fall refusal holds for the damage, the member is left at the share the refusal keeps and its change is
// Recorded as refused, and a character already down takes nothing
export const damagePartyMember = (
  party: Party,
  characterId: number,
  lostHealthShare: number,
  sourceCharacterId?: number,
  fallRefusal?: FallRefusal,
): void => {
  const partyMember = getPartyMember(party, characterId);
  if (partyMember.healthShare === 0 || lostHealthShare <= 0) return;
  const previousHealthShare = partyMember.healthShare;
  const remainingHealthShare = previousHealthShare - lostHealthShare;
  const isFallRefused = remainingHealthShare <= 0 && fallRefusal !== undefined && fallRefusal.refuses();
  partyMember.healthShare = isFallRefused ? fallRefusal.healthShare : Math.max(0, remainingHealthShare);
  party.healthChanges.push({
    characterId,
    healthShare: partyMember.healthShare - previousHealthShare,
    ...(isFallRefused ? { isFallRefused } : {}),
    overflowHealthShare: 0,
    ...(sourceCharacterId === undefined ? {} : { sourceCharacterId }),
  });
  if (partyMember.healthShare > 0) return;
  partyMember.energy = 0;
  if (getDeployedCharacterIds(party)[party.activeIndex] === characterId)
    party.fallSecondsRemaining = PARTY_FALL_SECONDS;
};
