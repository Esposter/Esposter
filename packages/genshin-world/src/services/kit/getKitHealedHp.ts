import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { Party } from "#src/models/party/Party";

import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";

// The HP a heal restores to the member it heals, its share of that member's Max HP as its buffs stand, with the
// Overflow past full HP and the share a Bond of Life took counted in, as the Sea-Dyed Foam and the Song of Days Past
// Record it. A drain, or a member the team does not build, heals nothing
export const getKitHealedHp = (
  { bondOfLifeShare, characterId, healthShare, overflowHealthShare }: KitHealthChangedEvent,
  effects: readonly KitEffect[],
  party: Party,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
): number => {
  const member = characterIdCombatantMap.get(characterId);
  if (!member) return 0;
  return (
    Math.max(0, healthShare + overflowHealthShare + bondOfLifeShare) *
    getKitMaxHealth(member, effects, party, characterIdCombatantMap)
  );
};
