import type { LunarChargedCloud } from "#src/models/party/LunarChargedCloud";
import type { PartyHealthChange } from "#src/models/party/PartyHealthChange";
import type { PartyMember } from "#src/models/party/PartyMember";
import type { PartyTeam } from "#src/models/party/PartyTeam";
import type { VerdantDew } from "#src/models/party/VerdantDew";

// The player's party: the teams set up in Party Setup, the one deployed, the index of its member on the field, each
// Character's own HP, energy and cooldowns by its id, the seconds on the world's clock at the last switch, the Verdant
// Dew the party holds and its Lunar-Charged cloud
export interface Party {
  activeIndex: number;
  characterIdMemberMap: Map<number, PartyMember>;
  deployedTeamIndex: number;
  // The changes to its members' HP not yet sent to the deployed team's kits, which the step on the field sends and empties
  healthChanges: PartyHealthChange[];
  lunarChargedCloud: LunarChargedCloud;
  switchedSeconds: number;
  teams: PartyTeam[];
  verdantDew: VerdantDew;
}
