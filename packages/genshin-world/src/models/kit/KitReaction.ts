import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { DendroCoreKind } from "#src/models/kit/DendroCoreKind";

// A reaction a deployed member's party bonus is read against: the combatant that makes it and the reaction it is
export interface KitReaction {
  combatant: Combatant;
  // The kind of Dendro Core the reaction bursts from, if it is a core's burst
  coreKind?: DendroCoreKind;
  reactionType: ReactionType;
}
