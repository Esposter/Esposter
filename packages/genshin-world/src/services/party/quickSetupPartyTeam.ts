import type { Party } from "#src/models/party/Party";

import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { PARTY_TEAM_SIZE } from "#src/services/party/constants";
import { setPartyTeamCharacters } from "#src/services/party/setPartyTeamCharacters";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Quick Setup fills a team's empty slots with the next characters the player holds, in the order they are listed, each
// Not already in the team. The members the team has keep their slots, and a team already full is left as it is
export const quickSetupPartyTeam = (
  party: Party,
  teamIndex: number,
  characterIds: readonly number[],
): PartyTeamResult => {
  const team = party.teams[teamIndex];
  if (!team) throw new InvalidOperationError(Operation.Update, quickSetupPartyTeam.name, `no team ${teamIndex}`);
  const emptySlotCount = PARTY_TEAM_SIZE - team.characterIds.length;
  const nextCharacterIds = characterIds
    .filter((characterId) => !team.characterIds.includes(characterId))
    .slice(0, emptySlotCount);
  if (nextCharacterIds.length === 0) return PartyTeamResult.Done;
  return setPartyTeamCharacters(party, teamIndex, [...team.characterIds, ...nextCharacterIds]);
};
