import type { Party } from "#src/models/party/Party";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The character on the field: the deployed team's member at the active index
export const getActiveCharacterId = (party: Party): number => {
  const characterId = party.teams[party.deployedTeamIndex]?.characterIds[party.activeIndex];
  if (characterId === undefined)
    throw new InvalidOperationError(Operation.Read, getActiveCharacterId.name, "no member on the field");
  return characterId;
};
