import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";

// The reaction an element triggers on a Dendro Core: Electro sends it off as Hyperbloom, Pyro bursts it as Burgeon
export const DendroCoreReactionTypeMap: Partial<Record<Element, TransformativeReactionType>> = {
  [Element.Electro]: TransformativeReactionType.Hyperbloom,
  [Element.Pyro]: TransformativeReactionType.Burgeon,
};
