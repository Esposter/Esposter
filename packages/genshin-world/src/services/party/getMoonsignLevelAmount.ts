import type { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";

import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";

// The amount a team's Moonsign level gives, from the amount at each level, and none for a team with no Moonsign
// Character
export const getMoonsignLevelAmount = (
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  party: Party,
  moonsignLevelAmountMap: Record<MoonsignLevel, number>,
): number => {
  const moonsignLevel = getMoonsignLevel(characterIdCombatantMap, party);
  return moonsignLevel === undefined ? 0 : moonsignLevelAmountMap[moonsignLevel];
};
