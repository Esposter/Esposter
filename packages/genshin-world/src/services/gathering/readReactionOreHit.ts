import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import type { ReactionPoise } from "#src/models/enemy/ReactionPoise";
import type { OreHit } from "#src/models/gathering/OreHit";

import { TransformativeReactionReachRadiusMap } from "#src/services/combat/reach/TransformativeReactionReachRadiusMap";

// The hit an ore takes from a reaction that lands: a blunt one of the poise its reach deals, over the whole circle about
// Where it landed at any height, as its reach finds an enemy. A reaction whose hit is not blunt strikes no ore
export const readReactionOreHit = (
  reactionPoiseMap: ReadonlyMap<TransformativeReactionType, ReactionPoise>,
  reactionType: TransformativeReactionType,
): OreHit | undefined => {
  const reactionPoise = reactionPoiseMap.get(reactionType);
  const radius = TransformativeReactionReachRadiusMap[reactionType];
  if (!reactionPoise?.isBlunt || radius === undefined) return undefined;
  return {
    hitArea: { angle: 2 * Math.PI, height: Number.POSITIVE_INFINITY, radius },
    isBlunt: true,
    isMelee: false,
    poiseDamage: reactionPoise.reachPoiseDamage,
  };
};
