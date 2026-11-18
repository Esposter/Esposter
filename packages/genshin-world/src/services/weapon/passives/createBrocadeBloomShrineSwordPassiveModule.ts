import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const BROCADE_BLOOM_BOOST_ID = "brocadeBloomGeoBoost";

// Brocade Bloom, Shrine Sword at its rank: the wielder's Normal Attack DMG and Elemental Skill DMG are raised by the rank's
// First and second amounts. A Geo hit a nearby active character deals boosts both by the rank's share, which is 100% at every
// Rank, for the rank's seconds
export const createBrocadeBloomShrineSwordPassiveModule = (params: number[]): PassiveModule => {
  const normalAttackBonus = takeOne(params, 1);
  const elementalSkillBonus = takeOne(params, 2);
  const boostShare = takeOne(params, 3);
  const seconds = takeOne(params, 4);
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) => {
      const multiplier = checkIsKitStatusActive(effects, strike.combatant.characterId, BROCADE_BLOOM_BOOST_ID)
        ? 1 + boostShare
        : 1;
      if (strike.attackTag === AttackTag.NormalAttack) return normalAttackBonus * multiplier;
      if (strike.attackTag === AttackTag.ElementalSkill) return elementalSkillBonus * multiplier;
      return 0;
    },
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind === KitEventKind.EnemyHit &&
        event.element === Element.Geo &&
        event.striker.characterId === context.activeCombatant.characterId
      )
        addKitStatus(context.kitEffectState, combatant.characterId, {
          id: BROCADE_BLOOM_BOOST_ID,
          secondsRemaining: seconds,
        });
    },
  };
};
