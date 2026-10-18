import type { Attribute } from "#src/models/character/Attribute";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

// A passive that, as its wielder uses its Elemental Skill, raises each of its attributes by the rank's amount for it,
// The rank's params in the attributes' order, for the seconds the param after them gives. Each skill restarts the
// Buffs, as a buff of the same attribute from the same source does
export const createSkillBuffPassiveModule = (
  params: number[],
  { attributes, source }: { attributes: Attribute[]; source: string },
): PassiveModule => {
  const amounts = attributes.map((_attribute, index) => takeOne(params, index));
  const seconds = takeOne(params, attributes.length);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.SkillUsed || event.characterId !== combatant.characterId) return;
      for (const [index, attribute] of attributes.entries())
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: takeOne(amounts, index),
          attribute,
          secondsRemaining: seconds,
          source,
        });
    },
  };
};
