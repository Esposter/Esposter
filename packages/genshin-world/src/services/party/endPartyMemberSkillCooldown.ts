import type { Party } from "#src/models/party/Party";

import { getPartyMember } from "#src/services/party/getPartyMember";

// A party member's skill ready at once: its cooldown ends, as an effect or a passive's chance ends it
export const endPartyMemberSkillCooldown = (party: Party, characterId: number): void => {
  getPartyMember(party, characterId).skillCooldownSeconds = 0;
};
