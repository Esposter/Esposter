import type { ReactionStep } from "#src/models/combat/ReactionStep";

import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";

// The reactions each element tries on a target, in the game's priority, what is left of the trigger after one going on
// To the next. Electro-Charged is no step but Electro and Hydro left beside each other, and Burgeon and Hyperbloom are
// A Dendro Core's own (`DendroCoreReactionTypeMap`)
export const ElementReactionStepsMap: Record<Element, ReactionStep[]> = {
  [Element.Anemo]: [
    { auraTypes: [AuraType.Electro], coefficient: 0.5, element: Element.Electro, reactionType: ReactionType.Swirl },
    {
      auraTypes: [AuraType.Pyro, AuraType.Burning],
      coefficient: 0.5,
      element: Element.Pyro,
      reactionType: ReactionType.Swirl,
    },
    { auraTypes: [AuraType.Hydro], coefficient: 0.5, element: Element.Hydro, reactionType: ReactionType.Swirl },
    { auraTypes: [AuraType.Cryo], coefficient: 0.5, element: Element.Cryo, reactionType: ReactionType.Swirl },
    { auraTypes: [AuraType.Freeze], coefficient: 0.5, element: Element.Cryo, reactionType: ReactionType.Swirl },
  ],
  [Element.Cryo]: [
    { auraTypes: [AuraType.Electro], coefficient: 1, element: Element.Cryo, reactionType: ReactionType.Superconduct },
    {
      auraTypes: [AuraType.Pyro, AuraType.Burning],
      coefficient: 0.5,
      element: Element.Cryo,
      reactionType: ReactionType.Melt,
    },
    { auraTypes: [AuraType.Hydro], coefficient: 1, reactionType: ReactionType.Frozen },
  ],
  [Element.Dendro]: [
    { auraTypes: [AuraType.Quicken], coefficient: 0, element: Element.Dendro, reactionType: ReactionType.Spread },
    { auraTypes: [AuraType.Electro], coefficient: 1, reactionType: ReactionType.Quicken },
    {
      auraTypes: [AuraType.Pyro, AuraType.Burning],
      coefficient: 0,
      element: Element.Pyro,
      reactionType: ReactionType.Burning,
    },
    { auraTypes: [AuraType.Hydro], coefficient: 2, element: Element.Dendro, reactionType: ReactionType.Bloom },
  ],
  [Element.Electro]: [
    { auraTypes: [AuraType.Quicken], coefficient: 0, element: Element.Electro, reactionType: ReactionType.Aggravate },
    {
      auraTypes: [AuraType.Pyro, AuraType.Burning],
      coefficient: 1,
      element: Element.Pyro,
      reactionType: ReactionType.Overloaded,
    },
    { auraTypes: [AuraType.Cryo], coefficient: 1, element: Element.Cryo, reactionType: ReactionType.Superconduct },
    { auraTypes: [AuraType.Freeze], coefficient: 1, element: Element.Cryo, reactionType: ReactionType.Superconduct },
    { auraTypes: [AuraType.Dendro], coefficient: 1, reactionType: ReactionType.Quicken },
  ],
  [Element.Geo]: [
    { auraTypes: [AuraType.Freeze], coefficient: 0, reactionType: ReactionType.Shattered },
    {
      auraTypes: [AuraType.Electro],
      coefficient: 0.5,
      element: Element.Electro,
      reactionType: ReactionType.Crystallize,
    },
    {
      auraTypes: [AuraType.Pyro, AuraType.Burning],
      coefficient: 0.5,
      element: Element.Pyro,
      reactionType: ReactionType.Crystallize,
    },
    { auraTypes: [AuraType.Hydro], coefficient: 0.5, element: Element.Hydro, reactionType: ReactionType.Crystallize },
    { auraTypes: [AuraType.Cryo], coefficient: 0.5, element: Element.Cryo, reactionType: ReactionType.Crystallize },
  ],
  [Element.Hydro]: [
    {
      auraTypes: [AuraType.Pyro, AuraType.Burning],
      coefficient: 2,
      element: Element.Hydro,
      reactionType: ReactionType.Vaporize,
    },
    { auraTypes: [AuraType.Cryo], coefficient: 1, reactionType: ReactionType.Frozen },
    {
      auraTypes: [AuraType.Dendro, AuraType.Quicken],
      coefficient: 0.5,
      element: Element.Dendro,
      reactionType: ReactionType.Bloom,
    },
  ],
  [Element.Pyro]: [
    { auraTypes: [AuraType.Electro], coefficient: 1, element: Element.Pyro, reactionType: ReactionType.Overloaded },
    { auraTypes: [AuraType.Hydro], coefficient: 0.5, element: Element.Pyro, reactionType: ReactionType.Vaporize },
    {
      auraTypes: [AuraType.Cryo, AuraType.Freeze],
      coefficient: 2,
      element: Element.Pyro,
      reactionType: ReactionType.Melt,
    },
    {
      auraTypes: [AuraType.Dendro, AuraType.Quicken],
      coefficient: 0,
      element: Element.Pyro,
      reactionType: ReactionType.Burning,
    },
  ],
};
