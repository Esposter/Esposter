import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitShielded } from "#src/services/kit/effects/checkIsKitShielded";
import { takeOne } from "@esposter/shared";

const DESERT_WATCH_SKILL_SOURCE = "desertWatchSkill";
const DESERT_WATCH_DAMAGE_SOURCE = "desertWatchDamage";

// Desert Watch at its rank: an Elemental Skill hit the wielder deals, and damage it takes, each raise its ATK by the
// Rank's Amount for the rank's seconds, whether or not it is on the field. Its Max HP rises by the rank's last amount
// While it is not Protected by a shield on the field
export const createDesertWatchPassiveModule = (params: number[]): PassiveModule => {
  const skillAmount = takeOne(params, 0);
  const skillSeconds = takeOne(params, 1);
  const damageAmount = takeOne(params, 2);
  const damageSeconds = takeOne(params, 3);
  const maximumHealthShare = takeOne(params, 4);
  return {
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants, effects) => {
      const isOnField = deployedCombatants.find(({ characterId }) => characterId === combatant.characterId)?.isOnField;
      return checkIsKitShielded(effects, isOnField ?? false)
        ? []
        : [{ amount: maximumHealthShare, attribute: Attribute.HealthPercent }];
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === combatant.characterId &&
        event.attackTag === AttackTag.ElementalSkill
      )
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: skillAmount,
          attribute: Attribute.AttackPercent,
          secondsRemaining: skillSeconds,
          source: DESERT_WATCH_SKILL_SOURCE,
        });
      else if (event.kind === KitEventKind.PartyMemberStruck && event.struckCharacterId === combatant.characterId)
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: damageAmount,
          attribute: Attribute.AttackPercent,
          secondsRemaining: damageSeconds,
          source: DESERT_WATCH_DAMAGE_SOURCE,
        });
    },
  };
};
