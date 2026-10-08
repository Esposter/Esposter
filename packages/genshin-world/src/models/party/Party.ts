import type { PartyMember } from "#src/models/party/PartyMember";
import type { PartyTeam } from "#src/models/party/PartyTeam";

// The player's party: the teams set up in Party Setup, the one deployed, the index of its member on the field, each
// Character's own HP, energy and cooldowns by its id, and the seconds on the world's clock at the last switch
export interface Party {
  activeIndex: number;
  characterIdMemberMap: Map<number, PartyMember>;
  deployedTeamIndex: number;
  switchedSeconds: number;
  teams: PartyTeam[];
}
