import type { Party } from "#src/models/party/Party";

import { checkIsPartyTeam } from "#src/services/party/checkIsPartyTeam";
import { DEFAULT_PARTY_TEAM_COUNT, PARTY_SWITCH_COOLDOWN_SECONDS } from "#src/services/party/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A party as the game starts one: its four default teams, the first deployed with these characters and its first
// Member on the field, nobody down, and a switch allowed at once. The deployed team needs someone on the field, so it
// Is refused empty as well as past a team's rules
export const createParty = (characterIds: number[]): Party => {
  if (characterIds.length === 0 || !checkIsPartyTeam(characterIds))
    throw new InvalidOperationError(
      Operation.Create,
      createParty.name,
      `team 0 cannot hold ${characterIds.join(", ")}`,
    );
  return {
    activeIndex: 0,
    deployedTeamIndex: 0,
    fallenCharacterIds: [],
    switchedSeconds: -PARTY_SWITCH_COOLDOWN_SECONDS,
    teams: Array.from({ length: DEFAULT_PARTY_TEAM_COUNT }, (_value, index) => ({
      characterIds: index === 0 ? characterIds : [],
      name: "",
    })),
  };
};
