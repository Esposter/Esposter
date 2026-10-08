import type { Element } from "#src/models/Element";

import { CAMPFIRE_LIGHTING_ELEMENT, CAMPFIRE_PUTTING_OUT_ELEMENTS } from "#src/services/cooking/constants";

// Whether a campfire is lit after an element strikes it: Pyro lights it, the elements that put it out put it out, and any
// Other element leaves it as it was
export const applyCampfireElement = (isLit: boolean, element: Element): boolean => {
  if (element === CAMPFIRE_LIGHTING_ELEMENT) return true;
  if (CAMPFIRE_PUTTING_OUT_ELEMENTS.includes(element)) return false;
  return isLit;
};
