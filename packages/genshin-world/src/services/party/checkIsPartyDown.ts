import type { Party } from "#src/models/party/Party";

import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Whether every member of the deployed team is down, which ends the fight in the game's "All members have fallen"
export const checkIsPartyDown = (party: Party): boolean =>
  getDeployedCharacterIds(party).every((characterId) => checkIsCharacterDown(party, characterId));
