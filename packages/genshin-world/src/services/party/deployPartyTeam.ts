import type { Party } from "#src/models/party/Party";

import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Deploys a team set up in Party Setup, its first member standing taking the field: refused for a team with nobody in
// It, and for one whose members are all down
export const deployPartyTeam = (party: Party, teamIndex: number): PartyTeamResult => {
  const team = party.teams[teamIndex];
  if (!team) throw new InvalidOperationError(Operation.Update, deployPartyTeam.name, `no team ${teamIndex}`);
  const activeIndex = team.characterIds.findIndex((characterId) => !party.fallenCharacterIds.includes(characterId));
  if (team.characterIds.length === 0) return PartyTeamResult.Empty;
  else if (activeIndex === -1) return PartyTeamResult.Down;
  party.activeIndex = activeIndex;
  party.deployedTeamIndex = teamIndex;
  return PartyTeamResult.Done;
};
