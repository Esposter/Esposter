import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Element } from "#src/models/Element";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";

// Whether Enduring Rock is in effect for a combatant: the deployed team holds Geo's resonance, and a shield is live on
// The team, which protects the character on the field
export const checkIsEnduringRock = (combatant: Combatant, effects: readonly KitEffect[]): boolean =>
  combatant.elementalResonances.includes(Element.Geo) && effects.some((effect) => checkIsKitShieldLive(effect));
