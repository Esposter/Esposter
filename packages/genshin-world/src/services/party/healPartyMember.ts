import type { Party } from "#src/models/party/Party";

import { getPartyMember } from "#src/services/party/getPartyMember";

// Restores a share of a character's Max HP to it, never above all of it, and records the change for the kits, the share
// Past full as its overflow, so a heal on a member at full HP is still heard. A Bond of Life it carries takes the heal
// Before the HP does, and the share it took is recorded with the change. A character that is down stays down, since only
// A revive brings one back, and the character healing is the source the change names
export const healPartyMember = (
  party: Party,
  characterId: number,
  healedHealthShare: number,
  sourceCharacterId?: number,
): void => {
  const partyMember = getPartyMember(party, characterId);
  if (partyMember.healthShare === 0 || healedHealthShare <= 0) return;
  const bondOfLifeShare = Math.min(partyMember.bondOfLifeShare ?? 0, healedHealthShare);
  if (bondOfLifeShare > 0) partyMember.bondOfLifeShare = (partyMember.bondOfLifeShare ?? 0) - bondOfLifeShare;
  const restoredHealthShare = healedHealthShare - bondOfLifeShare;
  const previousHealthShare = partyMember.healthShare;
  partyMember.healthShare = Math.min(1, previousHealthShare + restoredHealthShare);
  const healthShare = partyMember.healthShare - previousHealthShare;
  party.healthChanges.push({
    characterId,
    healthShare,
    overflowHealthShare: restoredHealthShare - healthShare,
    ...(bondOfLifeShare > 0 ? { bondOfLifeShare } : {}),
    ...(sourceCharacterId === undefined ? {} : { sourceCharacterId }),
  });
};
