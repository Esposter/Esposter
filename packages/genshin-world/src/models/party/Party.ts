import type { PartyTeam } from "#src/models/party/PartyTeam";

// The player's party: the teams set up in Party Setup, the one deployed, the index of its member on the field, the
// Characters who are down, and the seconds on the world's clock at the last switch
export interface Party {
  activeIndex: number;
  deployedTeamIndex: number;
  fallenCharacterIds: number[];
  switchedSeconds: number;
  teams: PartyTeam[];
}
