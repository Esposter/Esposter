import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { getLunarReactionDamage } from "#src/services/combat/damage/getLunarReactionDamage";
import { getStellarConductCoefficient } from "#src/services/combat/damage/getStellarConductCoefficient";
import { RADIANCE_STELLAR_CONDUCT_STATUS_ID } from "#src/services/kit/constants";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getDirectReactionDamage } from "#src/services/kit/getDirectReactionDamage";
import { getPartyStellarBaseDamageBonus } from "#src/services/party/getPartyStellarBaseDamageBonus";

// A direct Stellar hit's damage: the Glimmer formula over its talent multiplier of its striker's ATK at its reaction's
// Coefficient, raised by the Base DMG Bonus of the deployed team's Stellar Jubilees and by its elemental mastery and
// Its Stellar Glimmer reaction DMG Bonus with the party's, its flat bonus added after, cut by the enemy's RES alone,
// Its DEF wholly ignored, and raised by a CRIT hit's CRIT DMG with the hit's own and the party's and by the Elevation
// Last, as gcsim (MIT) prices a direct reaction hit (pkg/enemy/damage.go, calcDirectReaction) and every direct Stellar
// Hit ignores DEF (yaemiko/stellar.go:97, odette/skill.go:142). A Stellar-Conduct's coefficient is the Starlight
// Prism's by the count of hits its striker's Radiance: Stellar-Conduct carries, as gcsim reads the striker's
// PolestarFieldStacksKey tag into StellarconductMult (pkg/enemy/damage.go:212), and a Stellar Swirl's is 1
export const getDirectStellarDamage = (
  { additiveBaseDamageBonus, criticalDamageBonus = 0 }: KitHit,
  stellarReactionType: StellarReactionType,
  talentMultiplier: number,
  combatant: Combatant,
  context: KitContext,
  resistance: number,
  isCritical: boolean,
  partyBonuses: { criticalDamageBonus: number; damageBonus: number; elevationBonus: number },
): number => {
  const { characterIdCombatantMap, kitEffectState, party } = context;
  const { attack, attributeTotalMap } = combatant.attributes;
  const coefficient =
    stellarReactionType === StellarReactionType.StellarConduct
      ? getStellarConductCoefficient(
          findKitStatus(kitEffectState.effects, combatant.characterId, RADIANCE_STELLAR_CONDUCT_STATUS_ID)?.stacks ?? 0,
        )
      : 1;
  const stellarDamage = getLunarReactionDamage(
    coefficient,
    talentMultiplier * attack,
    attributeTotalMap[Attribute.ElementalMastery],
    getPartyStellarBaseDamageBonus(characterIdCombatantMap, kitEffectState.effects, party, context.body.position),
    attributeTotalMap[Attribute.StellarGlimmerReactionDamageBonus] + partyBonuses.damageBonus,
  );
  return getDirectReactionDamage(
    stellarDamage,
    additiveBaseDamageBonus?.(combatant) ?? 0,
    resistance,
    isCritical,
    attributeTotalMap[Attribute.CriticalDamage] + criticalDamageBonus + partyBonuses.criticalDamageBonus,
    partyBonuses.elevationBonus,
  );
};
