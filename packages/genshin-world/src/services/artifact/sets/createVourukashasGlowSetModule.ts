import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { takeOne } from "@esposter/shared";

const VOURUKASHAS_GLOW_STACK_ID = "vourukashasGlowStack";

// Vourukasha's Glow. Its four-piece bonus raises its wearer's Elemental Skill and Elemental Burst DMG by the first param, and each
// Enemy strike that takes HP from the wearer adds a stack, for the third param's seconds, of the first param times the second, up to
// The fourth param's stacks. A stack counts apart from the others, so a stack past the maximum replaces the one that runs out first.
// A drain the wearer's own kit made does not count, and neither does a heal
export const createVourukashasGlowSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const damageBonus = takeOne(bonus.params, 0);
  const stackDamageBonus = damageBonus * takeOne(bonus.params, 1);
  const seconds = takeOne(bonus.params, 2);
  const maximumStacks = takeOne(bonus.params, 3);
  return {
    getStrikeDamageBonus: (strike, _enemy, _party, effects) => {
      if (strike.attackTag !== AttackTag.ElementalSkill && strike.attackTag !== AttackTag.ElementalBurst) return 0;
      return (
        damageBonus + stackDamageBonus * countKitHolds(effects, strike.combatant.characterId, VOURUKASHAS_GLOW_STACK_ID)
      );
    },
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.characterId !== combatant.characterId ||
        event.healthShare >= 0 ||
        event.sourceCharacterId !== undefined
      )
        return;
      addKitHold(context.kitEffectState, combatant.characterId, {
        id: VOURUKASHAS_GLOW_STACK_ID,
        maximum: maximumStacks,
        replacesOldest: true,
        seconds,
      });
    },
  };
};
