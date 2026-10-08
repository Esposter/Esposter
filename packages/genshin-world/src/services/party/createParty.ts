import type { Party } from "#src/models/party/Party";

import { DEFAULT_PARTY_TEAM_COUNT, PARTY_SWITCH_COOLDOWN_SECONDS } from "#src/services/party/constants";

// A party as the game starts one: its four default teams, the first deployed with these characters and its first
// Member on the field, nobody down, and a switch allowed at once
export const createParty = (characterIds: number[]): Party => ({
  activeIndex: 0,
  deployedTeamIndex: 0,
  fallenCharacterIds: [],
  switchedSeconds: -PARTY_SWITCH_COOLDOWN_SECONDS,
  teams: Array.from({ length: DEFAULT_PARTY_TEAM_COUNT }, (_value, index) => ({
    characterIds: index === 0 ? characterIds : [],
    name: "",
  })),
});
