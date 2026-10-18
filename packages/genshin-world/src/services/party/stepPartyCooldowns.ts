import type { Party } from "#src/models/party/Party";

import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { runDownSeconds } from "#src/services/runDownSeconds";

// Lowers the skill and burst cooldowns of every member of the deployed team by the step's seconds, none below zero. The
// Cooldowns run off the field too, as the game's do. A cooldown is written only while it runs, so a team at rest writes
// Nothing, where the world's reactive party would pay a reactive write for each unchanged zero every step
export const stepPartyCooldowns = (party: Party, stepSeconds: number): void => {
  for (const characterId of getDeployedCharacterIds(party)) {
    const partyMember = getPartyMember(party, characterId);
    if (partyMember.burstCooldownSeconds > 0)
      partyMember.burstCooldownSeconds = Math.max(0, runDownSeconds(partyMember.burstCooldownSeconds, stepSeconds));
    if (partyMember.skillCooldownSeconds > 0)
      partyMember.skillCooldownSeconds = Math.max(0, runDownSeconds(partyMember.skillCooldownSeconds, stepSeconds));
  }
  // The team's particle cooldowns run off in the same step, each written only while it runs
  for (const [particleSource, cooldownSeconds] of party.particleCooldownSecondsMap)
    if (cooldownSeconds > 0)
      party.particleCooldownSecondsMap.set(particleSource, Math.max(0, runDownSeconds(cooldownSeconds, stepSeconds)));
};
