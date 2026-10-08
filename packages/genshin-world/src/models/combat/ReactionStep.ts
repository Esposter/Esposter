import type { AuraType } from "#src/models/combat/AuraType";
import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Element } from "#src/models/Element";

// One reaction an applied element tries, in the game's order: the auras it reacts with, consumed together where more
// Than one is present, the gauge of aura each unit of the trigger consumes, none where the two coexist instead, and
// The element its damage is dealt in
export interface ReactionStep {
  auraTypes: AuraType[];
  coefficient: number;
  element?: Element;
  reactionType: ReactionType;
}
