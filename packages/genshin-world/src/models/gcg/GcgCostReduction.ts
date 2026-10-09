import type { Element } from "#src/models/Element";
import type { GcgCostKind } from "#src/models/gcg/GcgCostKind";

// Dice a cost is reduced by: a count, of one element's dice, or of any dice when the element is undefined. A reduction
// With a kind takes off only the cost lines of that kind, such as the Unaligned dice a Normal Attack's Void cost names
export interface GcgCostReduction {
  count: number;
  element?: Element;
  kind?: GcgCostKind;
}
