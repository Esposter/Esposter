import type { Element } from "#src/models/Element";
import type { GcgCostKind } from "#src/models/gcg/GcgCostKind";

// One line of a skill's cost: the count it takes, and for dice of one element, that element
export type GcgCost =
  | { count: number; element: Element; kind: typeof GcgCostKind.Dice }
  | { count: number; kind: typeof GcgCostKind.Energy | typeof GcgCostKind.Matching | typeof GcgCostKind.Unaligned };
