import type { Party } from "#src/models/party/Party";

import { getPartyMember } from "#src/services/party/getPartyMember";

// Changes the skill cooldown a party member has running by its seconds: a negative number cuts it short, and one the change
// Leaves at zero is ready. The skill's cooldown is the party member's, not a status, so a constellation that cuts it is one call
export const changeKitSkillCooldown = (party: Party, characterId: number, seconds: number): void => {
  const partyMember = getPartyMember(party, characterId);
  partyMember.skillCooldownSeconds = Math.max(0, partyMember.skillCooldownSeconds + seconds);
};
