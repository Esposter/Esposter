import type { Party } from "#src/models/party/Party";

import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Whether the player is asked for the next member: the fall of the member on the field has played out, that member is
// Down, and a member of the deployed team is standing to take the field. With nobody standing, the game over is asked
export const checkIsNextMemberAsked = (party: Party): boolean => {
  const characterIds = getDeployedCharacterIds(party);
  const fieldCharacterId = characterIds[party.activeIndex];
  return (
    party.fallSecondsRemaining === 0 &&
    fieldCharacterId !== undefined &&
    checkIsCharacterDown(party, fieldCharacterId) &&
    characterIds.some((characterId) => !checkIsCharacterDown(party, characterId))
  );
};
