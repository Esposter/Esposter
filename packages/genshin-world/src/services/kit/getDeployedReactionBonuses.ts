import type { KitContext } from "#src/models/kit/KitContext";
import type { KitReaction } from "#src/models/kit/KitReaction";

import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";

// The flat base damage, CRIT DMG, CRIT Rate and DMG Bonus the deployed members' party reaction hooks add to a reaction, each
// Hook given its own member, the reaction and the world's combat state. Unlike a strike's, a member's own kit is read too, as
// Each hook guards on the reaction's combatant itself
export const getDeployedReactionBonuses = (reaction: KitReaction, context: KitContext) => {
  const bonuses = { additiveBaseDamageBonus: 0, criticalDamageBonus: 0, criticalRateBonus: 0, damageBonus: 0 };
  for (const member of getDeployedCombatants(context.party, context.characterIdCombatantMap)) {
    const bonus = member.kit.getPartyReactionBonus?.(member, reaction, context);
    bonuses.additiveBaseDamageBonus += bonus?.additiveBaseDamageBonus ?? 0;
    bonuses.criticalDamageBonus += bonus?.criticalDamageBonus ?? 0;
    bonuses.criticalRateBonus += bonus?.criticalRateBonus ?? 0;
    bonuses.damageBonus += bonus?.damageBonus ?? 0;
  }
  return bonuses;
};
