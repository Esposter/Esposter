import type { Party } from "#src/models/party/Party";

import { DROWN_HEALTH_SHARE_LOSS } from "#src/services/party/constants";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";

// The deployed team as the game leaves it when the member on the field drowns: every member loses its energy and a
// Share of its Max HP, and one whose HP that takes is down
export const drownParty = (party: Party): void => {
  for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? []) {
    getPartyMember(party, characterId).energy = 0;
    damagePartyMember(party, characterId, DROWN_HEALTH_SHARE_LOSS);
  }
};
