import type { AttackTag } from "#src/models/combat/AttackTag";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";

export interface AttackInstancePassive {
  // The attack tags whose hits the status adds its share to, and whose hits count as its instances once it is obtained
  attackTags: AttackTag[];
  // Whether a hit the wielder deals obtains the status, when it is not holding the status and is off its cooldown
  checkIsObtainedBy: (event: KitDamageTakenEvent) => boolean;
  cooldownSeconds: number;
  id: string;
  maximumInstances: number;
  masteryShare: number;
  seconds: number;
}

// A passive whose wielder obtains a status on a hit its predicate names, once every cooldown. The status adds the share of
// Elemental Mastery as base damage to the hits of its attack tags the wielder deals, and ends after its instances or its
// Seconds, whichever comes first
export const createAttackInstancePassiveModule = ({
  attackTags,
  checkIsObtainedBy,
  cooldownSeconds,
  id,
  maximumInstances,
  masteryShare,
  seconds,
}: AttackInstancePassive): WeaponPassiveModule => {
  const cooldownId = `${id}Cooldown`;
  return {
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, party, effects, characterIdCombatantMap) => {
      if (
        strike.attackTag === undefined ||
        !attackTags.includes(strike.attackTag) ||
        !checkIsKitStatusActive(effects, strike.combatant.characterId, id)
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
      const status = findKitStatus(kitEffectState.effects, characterId, id);
      if (status !== undefined && checkIsKitStatusActive(kitEffectState.effects, characterId, id)) {
        if (event.attackTag === undefined || !attackTags.includes(event.attackTag)) return;
        const instances = (status.stacks ?? 0) + 1;
        addKitStatus(kitEffectState, characterId, {
          id,
          secondsRemaining: instances < maximumInstances ? status.secondsRemaining : 0,
          stacks: instances,
        });
        return;
      }
      if (!checkIsObtainedBy(event) || checkIsKitStatusActive(kitEffectState.effects, characterId, cooldownId)) return;
      addKitStatus(kitEffectState, characterId, { id: cooldownId, secondsRemaining: cooldownSeconds });
      addKitStatus(kitEffectState, characterId, { id, secondsRemaining: seconds, stacks: 0 });
    },
  };
};
