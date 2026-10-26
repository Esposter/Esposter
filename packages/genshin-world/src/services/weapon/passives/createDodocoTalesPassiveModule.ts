import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

// Dodoco Tales at its rank: a normal attack hit its wielder deals raises its charged attack DMG by the rank's amount for the
// Rank's seconds, and a charged attack hit raises its ATK by the rank's second amount for the rank's second seconds
export const createDodocoTalesPassiveModule = (params: number[]): PassiveModule => {
  const chargedAttackDamageBonus = takeOne(params, 0);
  const chargedAttackDamageSeconds = takeOne(params, 1);
  const attackPercentage = takeOne(params, 2);
  const attackSeconds = takeOne(params, 3);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      if (event.attackTag === AttackTag.NormalAttack)
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: chargedAttackDamageBonus,
          attribute: Attribute.ChargedAttackDamageBonus,
          secondsRemaining: chargedAttackDamageSeconds,
          source: "dodocoTalesNormalAttack",
        });
      else if (event.attackTag === AttackTag.ChargedAttack)
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: attackPercentage,
          attribute: Attribute.AttackPercent,
          secondsRemaining: attackSeconds,
          source: "dodocoTalesChargedAttack",
        });
    },
  };
};
