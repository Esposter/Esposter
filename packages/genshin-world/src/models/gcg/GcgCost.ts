import type { Element } from "#src/models/Element";
import type { GcgCostKind } from "#src/models/gcg/GcgCostKind";

// One line of a skill's cost: the count it takes, and for dice of one element, that element
export type GcgCost =
  | { count: number; element: Element; kind: GcgCostKind.Dice }
  | { count: number; kind: GcgCostKind.Energy | GcgCostKind.Matching | GcgCostKind.Unaligned };
