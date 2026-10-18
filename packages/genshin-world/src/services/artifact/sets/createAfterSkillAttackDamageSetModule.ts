import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";

// A set's bonus that gives its wearer Normal Attack and Charged Attack DMG for the seconds given after the wearer uses its
// Elemental Skill, as the next use restarts the buffs rather than stacking them
export const createAfterSkillAttackDamageSetModule = ({
  amount,
  seconds,
  source,
}: {
  amount: number;
  seconds: number;
  source: string;
}): PassiveModule => ({
  onKitEvent: (event, { kitEffectState }, combatant) => {
    if (event.kind !== KitEventKind.SkillUsed || event.characterId !== combatant.characterId) return;
    for (const attribute of [Attribute.NormalAttackDamageBonus, Attribute.ChargedAttackDamageBonus])
      buffKitMember(kitEffectState, combatant.characterId, { amount, attribute, secondsRemaining: seconds, source });
  },
});
