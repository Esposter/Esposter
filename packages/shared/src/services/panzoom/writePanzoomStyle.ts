import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";

import { getOrCreate } from "#src/util/map/getOrCreate";

// Writes one property of an element's inline style. The value the property held before its first write is recorded,
// So restorePanzoomStyles can put it back, and a later write does not replace that record
export const writePanzoomStyle = (
  { styles }: PanzoomContext,
  element: PanzoomElement,
  property: string,
  value: string,
): void => {
  const values = getOrCreate(styles, element, () => new Map<string, string>());
  if (!values.has(property)) values.set(property, element.style.getPropertyValue(property));

  element.style.setProperty(property, value);
};
