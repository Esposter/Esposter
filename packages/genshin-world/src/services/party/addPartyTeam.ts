import type { Party } from "#src/models/party/Party";

import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { PARTY_TEAM_MAX_COUNT } from "#src/services/party/constants";

// Adds an empty team to Party Setup, with no name of its own: it shows the game's standing-by name until renamed. Party
// Setup keeps fifteen teams at most, the four default ones included, so an add past that is refused
export const addPartyTeam = (party: Party): PartyTeamResult => {
  if (party.teams.length >= PARTY_TEAM_MAX_COUNT) return PartyTeamResult.Full;
  party.teams.push({ characterIds: [], name: "" });
  return PartyTeamResult.Done;
};
