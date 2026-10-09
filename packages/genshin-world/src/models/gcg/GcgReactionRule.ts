import type { Element } from "#src/models/Element";

// One reaction a rule lists: its id in the game's table and the two elements it pairs, in either order
export interface GcgReactionRule {
  elements: [Element, Element];
  id: number;
}
