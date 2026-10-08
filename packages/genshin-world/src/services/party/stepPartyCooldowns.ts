import type { Party } from "#src/models/party/Party";

import { getPartyMember } from "#src/services/party/getPartyMember";

// Lowers the skill and burst cooldowns of every member of the deployed team by the step's seconds, none below zero. The
// Cooldowns run off the field too, as the game's do
export const stepPartyCooldowns = (party: Party, stepSeconds: number): void => {
  for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? []) {
    const partyMember = getPartyMember(party, characterId);
    partyMember.burstCooldownSeconds = Math.max(0, partyMember.burstCooldownSeconds - stepSeconds);
    partyMember.skillCooldownSeconds = Math.max(0, partyMember.skillCooldownSeconds - stepSeconds);
  }
};
