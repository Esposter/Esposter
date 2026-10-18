import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { getStackShare } from "#src/services/weapon/passives/getStackShare";
import { takeOne } from "@esposter/shared";

const ASHEN_NIGHTSTAR_ID = "ashenNightstar";
const ASHEN_NIGHTSTAR_MAXIMUM_STACKS = 4;

const checkIsStackingHit = (attackTag: AttackTag | undefined): boolean =>
  attackTag === AttackTag.NormalAttack ||
  attackTag === AttackTag.ChargedAttack ||
  attackTag === AttackTag.ElementalSkill ||
  attackTag === AttackTag.ElementalBurst;

// Daylight's Augury at its rank: its wielder's Elemental Skill and Burst DMG rise by the rank's percentage, and each normal,
// Charged, Elemental Skill or Elemental Burst hit it deals gains a stack of Ashen Nightstar for the rank's seconds. Each stack
// Runs its own seconds, and its ATK rises by the rank's share on the ladder of one to four stacks
export const createDaylightsAuguryPassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  const stackSeconds = takeOne(params, 1);
  const attackShares = params.slice(2, 6);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => [
      {
        amount: getStackShare(attackShares, countKitHolds(effects, combatant.characterId, ASHEN_NIGHTSTAR_ID)),
        attribute: Attribute.AttackPercent,
      },
    ],
    getStrikeDamageBonus: (strike) =>
      strike.attackTag === AttackTag.ElementalSkill || strike.attackTag === AttackTag.ElementalBurst ? damageBonus : 0,
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !checkIsStackingHit(event.attackTag)
      )
        return;
      addKitHold(kitEffectState, combatant.characterId, {
        id: ASHEN_NIGHTSTAR_ID,
        maximum: ASHEN_NIGHTSTAR_MAXIMUM_STACKS,
        seconds: stackSeconds,
      });
    },
  };
};
