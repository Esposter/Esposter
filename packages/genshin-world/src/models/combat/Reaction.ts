import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Element } from "#src/models/Element";

// A reaction a target took: the element its damage is dealt in, none for Shattered's physical damage or a reaction that
// Deals none, and the gauge a Swirl spreads its element at to the targets round it, or a Burning tick its Pyro at
export interface Reaction {
  element?: Element;
  reactionType: ReactionType;
  spreadGauge?: number;
}
