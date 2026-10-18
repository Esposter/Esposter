import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { takeOne } from "@esposter/shared";

const FOLIAR_INCISION_ID = "foliarIncision";
const FOLIAR_INCISION_COOLDOWN_ID = "foliarIncisionCooldown";

// Whitemoon Bristle at its rank: CRIT Rate rises by the rank's percentage. After a Normal Attack deals Elemental DMG, the
// Wielder obtains Foliar Incision, once every cooldown. It adds the rank's share of Elemental Mastery as base damage to the
// Normal Attack and Elemental Skill hits the wielder deals, and ends after the rank's DMG instances or seconds, whichever
// Comes first. The instances counted are the ones those two hits deal once it is obtained
export const createWhitemoonBristlePassiveModule = (params: number[]): WeaponPassiveModule => {
  const criticalRate = takeOne(params, 0);
  const masteryShare = takeOne(params, 1);
  const maximumInstances = takeOne(params, 2);
  const seconds = takeOne(params, 3);
  const cooldownSeconds = takeOne(params, 4);
  return {
    getPassiveBonuses: () => [{ amount: criticalRate, attribute: Attribute.CriticalRate }],
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, party, effects, characterIdCombatantMap) => {
      if (
        strike.attackTag === undefined ||
        ![AttackTag.NormalAttack, AttackTag.ElementalSkill].includes(strike.attackTag) ||
        !checkIsKitStatusActive(effects, strike.combatant.characterId, FOLIAR_INCISION_ID)
      )
        return 0;
      return (
        masteryShare *
        getBuffedCombatant(strike.combatant, effects, party, characterIdCombatantMap).attributes.attributeTotalMap[
          Attribute.ElementalMastery
        ]
      );
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      const { characterId } = combatant;
      const incision = findKitStatus(kitEffectState.effects, characterId, FOLIAR_INCISION_ID);
      if (incision !== undefined && checkIsKitStatusActive(kitEffectState.effects, characterId, FOLIAR_INCISION_ID)) {
        if (
          event.attackTag === undefined ||
          ![AttackTag.NormalAttack, AttackTag.ElementalSkill].includes(event.attackTag)
        )
          return;
        const instances = (incision.stacks ?? 0) + 1;
        addKitStatus(kitEffectState, characterId, {
          id: FOLIAR_INCISION_ID,
          secondsRemaining: instances < maximumInstances ? incision.secondsRemaining : 0,
          stacks: instances,
        });
        return;
      }
      if (
        event.attackTag !== AttackTag.NormalAttack ||
        event.hit.element === undefined ||
        checkIsKitStatusActive(kitEffectState.effects, characterId, FOLIAR_INCISION_COOLDOWN_ID)
      )
        return;
      addKitStatus(kitEffectState, characterId, { id: FOLIAR_INCISION_COOLDOWN_ID, secondsRemaining: cooldownSeconds });
      addKitStatus(kitEffectState, characterId, { id: FOLIAR_INCISION_ID, secondsRemaining: seconds, stacks: 0 });
    },
  };
};
