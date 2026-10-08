import type { Aura } from "#src/models/combat/Aura";
import type { Reaction } from "#src/models/combat/Reaction";

import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { ELECTRO_CHARGED_TICK_GAUGE } from "#src/services/combat/aura/constants";

// A tick of Electro-Charged, its gauge taken in place from the Electro and the Hydro, each that has more than it to give
export const tickElectroCharged = (auras: Map<AuraType, Aura>): Reaction => {
  for (const auraType of [AuraType.Electro, AuraType.Hydro]) {
    const aura = auras.get(auraType);
    if (aura && aura.gauge > ELECTRO_CHARGED_TICK_GAUGE) aura.gauge -= ELECTRO_CHARGED_TICK_GAUGE;
  }
  return { element: Element.Electro, reactionType: ReactionType.ElectroCharged };
};
