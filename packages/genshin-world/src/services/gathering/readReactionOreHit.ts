import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import type { OreHit } from "#src/models/gathering/OreHit";

import { TransformativeReactionPoiseDamageMap } from "#src/services/combat/damage/TransformativeReactionPoiseDamageMap";
import { TransformativeReactionReachRadiusMap } from "#src/services/combat/reach/TransformativeReactionReachRadiusMap";

// The hit an ore takes from a reaction that lands: a blunt one of the poise its own hit deals, over the whole circle
// Of its reach about where it landed at any height, as its reach finds an enemy. A reaction whose hit deals no poise
// Strikes no ore
export const readReactionOreHit = (reactionType: TransformativeReactionType): OreHit | undefined => {
  const poiseDamage = TransformativeReactionPoiseDamageMap[reactionType];
  const radius = TransformativeReactionReachRadiusMap[reactionType];
  if (poiseDamage === undefined || radius === undefined) return undefined;
  return {
    hitArea: { angle: 2 * Math.PI, height: Number.POSITIVE_INFINITY, radius },
    isBlunt: true,
    isMelee: false,
    poiseDamage,
  };
};
