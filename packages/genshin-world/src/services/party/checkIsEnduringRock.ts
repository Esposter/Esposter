import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Moondrift } from "#src/models/party/Moondrift";
import type { GroundPoint } from "genshin-engine";

import { Element } from "#src/models/Element";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { checkIsNearMoondrift } from "#src/services/party/checkIsNearMoondrift";

// Whether Enduring Rock is in effect for a combatant: the deployed team holds Geo's resonance, and either a shield is live
// On the team, which protects the character on the field, or a Moondrift stands near that character, which gives the team
// A shield's defence as the Elemental Resonance page of the Genshin Impact Wiki has it. The position is the character's
// On the field, and without it no Moondrift counts
export const checkIsEnduringRock = (
  combatant: Pick<Combatant, "elementalResonances">,
  effects: readonly KitEffect[],
  moondrifts: readonly Moondrift[] = [],
  position?: GroundPoint,
): boolean =>
  combatant.elementalResonances.includes(Element.Geo) &&
  (effects.some((effect) => checkIsKitShieldLive(effect)) ||
    (position !== undefined && moondrifts.some((moondrift) => checkIsNearMoondrift(moondrift, position))));
