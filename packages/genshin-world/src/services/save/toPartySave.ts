import type { Party } from "#src/models/party/Party";
import type { PartySave } from "#src/models/party/PartySave";

// The party as the save holds it: its teams, the one deployed, its member on the field, and the characters down
export const toPartySave = ({ activeIndex, characterIdMemberMap, deployedTeamIndex, teams }: Party): PartySave => ({
  activeIndex,
  deployedTeamIndex,
  downCharacterIds: [...characterIdMemberMap].flatMap(([characterId, { healthShare }]) =>
    healthShare === 0 ? [characterId] : [],
  ),
  teams: teams.map(({ characterIds, name }) => ({ characterIds: [...characterIds], name })),
});
