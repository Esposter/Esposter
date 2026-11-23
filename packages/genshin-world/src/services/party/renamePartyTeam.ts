import type { Party } from "#src/models/party/Party";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Renames a team set up in Party Setup. An empty name gives the team its own back, the game's name for it shows again:
// Party 1 to 4 for a default team, and the standing-by name for an added one
export const renamePartyTeam = (party: Party, teamIndex: number, name: string): void => {
  const team = party.teams[teamIndex];
  if (!team) throw new InvalidOperationError(Operation.Update, renamePartyTeam.name, `no team ${teamIndex}`);
  team.name = name;
};
