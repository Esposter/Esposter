import type { Party } from "#src/models/party/Party";

import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { checkIsPartyTeam } from "#src/services/party/checkIsPartyTeam";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Sets a team's members, each character once and four at most. On the deployed team the field keeps its slot, or the
// Last one past a shortened team, so the edit is refused for a team left with nobody in it and for a character who is
// Down landing in the slot on the field
export const setPartyTeamCharacters = (party: Party, teamIndex: number, characterIds: number[]): PartyTeamResult => {
  const team = party.teams[teamIndex];
  if (!team || !checkIsPartyTeam(characterIds))
    throw new InvalidOperationError(
      Operation.Update,
      setPartyTeamCharacters.name,
      `team ${teamIndex} cannot hold ${characterIds.join(", ")}`,
    );
  else if (teamIndex === party.deployedTeamIndex) {
    const activeIndex = Math.min(party.activeIndex, characterIds.length - 1);
    const activeCharacterId = characterIds[activeIndex];
    if (activeCharacterId === undefined) return PartyTeamResult.Empty;
    else if (party.fallenCharacterIds.includes(activeCharacterId)) return PartyTeamResult.Down;
    party.activeIndex = activeIndex;
  }

  team.characterIds = characterIds;
  return PartyTeamResult.Done;
};
