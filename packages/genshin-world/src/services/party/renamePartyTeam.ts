import type { Party } from "#src/models/party/Party";

import { DEFAULT_PARTY_TEAM_COUNT, PARTY_ADDED_TEAM_NAME } from "#src/services/party/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Renames a team set up in Party Setup. An empty name gives the team its own back: the game's name for one of the four
// Default teams, and "Team Standing By" for one added
export const renamePartyTeam = (party: Party, teamIndex: number, name: string): void => {
  const team = party.teams[teamIndex];
  if (!team) throw new InvalidOperationError(Operation.Update, renamePartyTeam.name, `no team ${teamIndex}`);
  team.name = name || (teamIndex < DEFAULT_PARTY_TEAM_COUNT ? "" : PARTY_ADDED_TEAM_NAME);
};
