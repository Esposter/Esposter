import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitReaction } from "#src/models/kit/KitReaction";

// The DMG Bonus a set gives the reactions its own wearer triggers, by the reaction's type, and none for another
// Member's or a type the map does not name
export const getOwnReactionDamageBonus = (
  member: Combatant,
  { combatant, reactionType }: KitReaction,
  reactionTypeDamageBonusMap: ReadonlyMap<ReactionType, number>,
): { damageBonus?: number } => {
  const damageBonus = reactionTypeDamageBonusMap.get(reactionType);
  return member.characterId === combatant.characterId && damageBonus !== undefined ? { damageBonus } : {};
};
