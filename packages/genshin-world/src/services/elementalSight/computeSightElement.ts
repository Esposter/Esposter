import type { ElementalState } from "#src/models/combat/ElementalState";
import type { Element } from "#src/models/Element";

import { AuraElementMap } from "#src/services/combat/aura/AuraElementMap";

// The element a target shows under the sight: the element of its strongest aura that names one, else its innate element
export const computeSightElement = (elementalState: ElementalState, innateElement?: Element): Element | undefined => {
  let strongestElement: Element | undefined;
  let strongestGauge = 0;
  for (const [auraType, { gauge }] of elementalState.auras) {
    const element = AuraElementMap[auraType];
    if (element !== undefined && gauge > strongestGauge) {
      strongestElement = element;
      strongestGauge = gauge;
    }
  }
  return strongestElement ?? innateElement;
};
