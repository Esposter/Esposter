import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";

// The HP a heal restores to the member it heals, its share of that member's Max HP with the overflow past full HP and the
// Share a Bond of Life took counted in, as the Sea-Dyed Foam and the Song of Days Past record it. A drain, or a member the
// Team does not build, heals nothing
export const getKitHealedHp = (
  { bondOfLifeShare, characterId, healthShare, overflowHealthShare }: KitHealthChangedEvent,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
): number => {
  const member = characterIdCombatantMap.get(characterId);
  if (!member) return 0;
  return Math.max(0, healthShare + overflowHealthShare + bondOfLifeShare) * member.attributes.maxHealth;
};
