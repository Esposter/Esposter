import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { DendroCoreKind } from "#src/models/kit/DendroCoreKind";

// A reaction a deployed member's party bonus is read against: the combatant that makes it, the element its damage is
// Dealt in, which for a Swirl is the element it absorbed and for a Lunar reaction its own hit's, none for Shattered's
// Physical damage, the enemy it lands on, which a bonus against an enemy under a status reads, and the reaction it is
export interface KitReaction {
  combatant: Combatant;
  // The kind of Dendro Core the reaction bursts from, if it is a core's burst
  coreKind?: DendroCoreKind;
  element: Element | undefined;
  enemy: Enemy;
  reactionType: ReactionType;
}
