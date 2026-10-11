import type { Party } from "#src/models/party/Party";

import { getPartyMember } from "#src/services/party/getPartyMember";

// Restores a share of a character's Max HP to it, never above all of it, and records the change for the kits, the share
// Past full as its overflow, so a heal on a member at full HP is still heard. A character that is down stays down, since
// Only a revive brings one back, and the character healing is the source the change names
export const healPartyMember = (
  party: Party,
  characterId: number,
  healedHealthShare: number,
  sourceCharacterId?: number,
): void => {
  const partyMember = getPartyMember(party, characterId);
  if (partyMember.healthShare === 0 || healedHealthShare <= 0) return;
  const previousHealthShare = partyMember.healthShare;
  partyMember.healthShare = Math.min(1, previousHealthShare + healedHealthShare);
  const healthShare = partyMember.healthShare - previousHealthShare;
  party.healthChanges.push({
    characterId,
    healthShare,
    overflowHealthShare: healedHealthShare - healthShare,
    ...(sourceCharacterId === undefined ? {} : { sourceCharacterId }),
  });
};
