import type { KitContext } from "#src/models/kit/KitContext";
import type { KitReaction } from "#src/models/kit/KitReaction";

import { sumKitBonuses } from "#src/services/kit/sumKitBonuses";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";

// The flat base damage, CRIT DMG, CRIT Rate, DMG Bonus and Elevation the deployed members' party reaction hooks add to a reaction, each
// Hook given its own member, the reaction and the world's combat state. Unlike a strike's, a member's own kit is read too, as
// Each hook guards on the reaction's combatant itself
export const getDeployedReactionBonuses = (reaction: KitReaction, context: KitContext) =>
  sumKitBonuses(
    { additiveBaseDamageBonus: 0, criticalDamageBonus: 0, criticalRateBonus: 0, damageBonus: 0, elevationBonus: 0 },
    getDeployedCombatants(context.party, context.characterIdCombatantMap).map((member) =>
      member.kit.getPartyReactionBonus?.(member, reaction, context),
    ),
  );
