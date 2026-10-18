import type { Party } from "#src/models/party/Party";
import type { PartySave } from "#src/models/party/PartySave";

import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";

// The party a save holds, as the game starts one on a visit: each team and the deployed one as saved, and every member
// Standing at full HP with none of its energy or cooldowns spent, but a character the save holds down
export const toParty = ({ activeIndex, deployedTeamIndex, downCharacterIds, teams }: PartySave): Party => {
  const party = createParty(teams[deployedTeamIndex]?.characterIds ?? []);
  const downCharacterIdSet = new Set(downCharacterIds);
  const characterIds = new Set([...teams.flatMap(({ characterIds }) => characterIds), ...downCharacterIds]);
  party.activeIndex = activeIndex;
  party.characterIdMemberMap = new Map(
    [...characterIds].map((characterId) => [
      characterId,
      { ...createPartyMember(), healthShare: downCharacterIdSet.has(characterId) ? 0 : 1 },
    ]),
  );
  party.deployedTeamIndex = deployedTeamIndex;
  party.teams = teams.map(({ characterIds, name }) => ({ characterIds: [...characterIds], name }));
  return party;
};
