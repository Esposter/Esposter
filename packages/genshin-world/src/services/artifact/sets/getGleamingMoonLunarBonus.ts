import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitReaction } from "#src/models/kit/KitReaction";

import { getFirstHolderDamageBonus } from "#src/services/artifact/sets/getFirstHolderDamageBonus";
import { checkIsLunarReactionType } from "#src/services/combat/checkIsLunarReactionType";

// The Lunar Reaction DMG Bonus a Gleaming Moon effect gives every party member's Lunar Reactions. The text gives it for each
// Different effect the party holds and none twice over, so it is given once over the party by its first holder
export const getGleamingMoonLunarBonus = (
  member: Combatant,
  { reactionType }: KitReaction,
  effectId: string,
  damageBonus: number,
  context: KitContext,
): { damageBonus?: number } =>
  checkIsLunarReactionType(reactionType) ? getFirstHolderDamageBonus(member, effectId, damageBonus, context) : {};
