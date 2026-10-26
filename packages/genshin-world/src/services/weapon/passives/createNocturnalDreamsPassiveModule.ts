import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

// Nocturnal Dreams at its rank: for the rank's seconds after a charged attack hits, its wielder's Elemental Mastery rises by
// The rank's first amount, and for the rank's second seconds after an Elemental Skill hits, by the rank's second amount. Each
// Hit restarts its own buff, and the two buffs stand apart
export const createNocturnalDreamsPassiveModule = (params: number[]): PassiveModule => {
  const chargedAttackMastery = takeOne(params, 0);
  const chargedAttackSeconds = takeOne(params, 1);
  const skillMastery = takeOne(params, 2);
  const skillSeconds = takeOne(params, 3);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      if (event.attackTag === AttackTag.ChargedAttack)
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: chargedAttackMastery,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: chargedAttackSeconds,
          source: "nocturnalDreamsChargedAttack",
        });
      else if (event.attackTag === AttackTag.ElementalSkill)
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: skillMastery,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: skillSeconds,
          source: "nocturnalDreamsSkill",
        });
    },
  };
};
