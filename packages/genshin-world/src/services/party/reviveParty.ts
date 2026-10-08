import type { Party } from "#src/models/party/Party";

import { REVIVE_HEALTH_SHARE } from "#src/services/party/constants";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Revives every member of the deployed team who is down at the share of its Max HP the game revives a fallen team with
export const reviveParty = (party: Party): void => {
  for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? []) {
    const partyMember = getPartyMember(party, characterId);
    if (partyMember.healthShare === 0) partyMember.healthShare = REVIVE_HEALTH_SHARE;
  }
};
