import type { Party } from "#src/models/party/Party";
import type { RestorativePower } from "#src/models/statue/RestorativePower";

import { getPartyMember } from "#src/services/party/getPartyMember";
import { reviveParty } from "#src/services/party/reviveParty";

// Auto-recover near a statue: the deployed team's fallen revive at the share the game revives them with, for nothing,
// And then every member under the threshold is healed up to it from the pool, the first slots first, so a pool that runs
// Short leaves the last slots where they stand. Returns the pool as it is after
export const autoRecoverParty = (
  party: Party,
  power: RestorativePower,
  thresholdHealthShare: number,
  getMaxHealth: (characterId: number) => number,
): RestorativePower => {
  reviveParty(party);
  let amount = power.amount;
  for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? []) {
    const partyMember = getPartyMember(party, characterId);
    const maxHealth = getMaxHealth(characterId);
    const healthGain = Math.min(Math.max(0, thresholdHealthShare - partyMember.healthShare) * maxHealth, amount);
    partyMember.healthShare += healthGain / maxHealth;
    amount -= healthGain;
  }
  return { ...power, amount };
};
