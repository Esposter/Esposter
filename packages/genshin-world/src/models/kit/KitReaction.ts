import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Element } from "#src/models/Element";
import type { Combatant } from "#src/models/kit/Combatant";

// A reaction a deployed member's party bonus is read against: the combatant that makes it, the element its damage is
// Dealt in, which for a Swirl is the element it absorbed and for a Lunar reaction its own hit's, none for Shattered's
// Physical damage, and the reaction it is
export interface KitReaction {
  combatant: Combatant;
  element: Element | undefined;
  reactionType: ReactionType;
}
