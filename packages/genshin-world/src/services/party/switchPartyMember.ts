import type { Party } from "#src/models/party/Party";

import { PartySwitchResult } from "#src/models/party/PartySwitchResult";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { PARTY_SWITCH_COOLDOWN_SECONDS } from "#src/services/party/constants";

// Puts the deployed team's member at this index on the field, as its key does at these seconds on the world's clock:
// Nothing for the member already there or an empty slot, refused for a character who is down, and refused until the
// Cooldown since the last switch has passed
export const switchPartyMember = (party: Party, index: number, seconds: number): PartySwitchResult => {
  const characterId = party.teams[party.deployedTeamIndex]?.characterIds[index];
  if (characterId === undefined || index === party.activeIndex) return PartySwitchResult.Unchanged;
  else if (checkIsCharacterDown(party, characterId)) return PartySwitchResult.Down;
  else if (seconds - party.switchedSeconds < PARTY_SWITCH_COOLDOWN_SECONDS) return PartySwitchResult.Cooldown;
  party.activeIndex = index;
  party.switchedSeconds = seconds;
  return PartySwitchResult.Switched;
};
