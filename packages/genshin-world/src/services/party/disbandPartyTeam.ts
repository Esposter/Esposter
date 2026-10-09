import type { Party } from "#src/models/party/Party";

import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { DEFAULT_PARTY_TEAM_COUNT } from "#src/services/party/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Disbands a team set up in Party Setup. The four default teams are kept, and so is the deployed one: a team before the
// Deployed one moves the index of the deployed team down by one, so the same team stays deployed
export const disbandPartyTeam = (party: Party, teamIndex: number): PartyTeamResult => {
  if (!party.teams[teamIndex])
    throw new InvalidOperationError(Operation.Delete, disbandPartyTeam.name, `no team ${teamIndex}`);
  else if (teamIndex < DEFAULT_PARTY_TEAM_COUNT || teamIndex === party.deployedTeamIndex) return PartyTeamResult.Kept;
  party.teams = party.teams.toSpliced(teamIndex, 1);
  if (teamIndex < party.deployedTeamIndex) party.deployedTeamIndex -= 1;
  return PartyTeamResult.Done;
};
