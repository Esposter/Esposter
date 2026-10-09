import type { Element } from "#src/models/Element";

// Dice a cost is reduced by: a count, of one element's dice, or of any dice when the element is undefined
export interface GcgCostReduction {
  count: number;
  element: Element | undefined;
}
