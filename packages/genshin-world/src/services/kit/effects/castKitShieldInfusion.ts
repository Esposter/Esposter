import type { Element } from "#src/models/Element";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";

// Casts the shield of a skill the combatant starts, its health computed from the combatant's Max HP, and infuses the
// Combatant with the skill's element for the infusion's seconds
export const castKitShieldInfusion = (
  context: KitContext,
  combatant: Combatant,
  {
    element,
    getShieldHealth,
    infusionSeconds,
    shieldSeconds,
  }: {
    element: Element;
    getShieldHealth: (maxHealth: number) => number;
    infusionSeconds: number;
    shieldSeconds: number;
  },
): void => {
  const { characterIdCombatantMap, kitEffectState, party } = context;
  const maxHealth = getKitMaxHealth(combatant, kitEffectState.effects, party, characterIdCombatantMap);
  castKitShield(context, combatant.characterId, {
    element,
    health: getShieldHealth(maxHealth),
    secondsRemaining: shieldSeconds,
  });
  addKitEffect(kitEffectState, {
    characterId: combatant.characterId,
    element,
    kind: "infusion",
    secondsRemaining: infusionSeconds,
  });
};
