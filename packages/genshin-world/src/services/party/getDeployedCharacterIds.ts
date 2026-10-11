import type { Party } from "#src/models/party/Party";

// The deployed team's members in slot order, none while no team is deployed
export const getDeployedCharacterIds = (party: Party): number[] =>
  party.teams[party.deployedTeamIndex]?.characterIds ?? [];
