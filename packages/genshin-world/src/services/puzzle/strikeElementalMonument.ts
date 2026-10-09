import type { Element } from "#src/models/Element";
import type { ElementalMonument } from "#src/models/puzzle/ElementalMonument";

import { applyElement } from "#src/services/combat/aura/applyElement";
import { lightElementalMonument } from "#src/services/puzzle/lightElementalMonument";

// A monument struck by an element at a gauge, written in place. The strike lands on its elemental state as it would on an
// Enemy, and the monument is lit by the element itself or by a reaction whose element is its own, reactions included.
// A lit monument's clock restarts from the strike
export const strikeElementalMonument = (monument: ElementalMonument, element: Element, gauge: number): void => {
  const reactions = applyElement(monument.elementalState, element, gauge);
  if (element === monument.element || reactions.some((reaction) => reaction.element === monument.element))
    lightElementalMonument(monument);
};
