import { PARTY_TEAM_SIZE } from "#src/services/party/constants";

// Whether characters can make up a team: four at most, each of them once
export const checkIsPartyTeam = (characterIds: number[]): boolean =>
  characterIds.length <= PARTY_TEAM_SIZE && new Set(characterIds).size === characterIds.length;
