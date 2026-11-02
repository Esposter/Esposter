import type { ReactionPoise } from "genshin-world";
import type { Except } from "type-fest";

import { TransformativeReactionType } from "genshin-world";

// The poise each transformative reaction deals, as the wiki's Interruption Resistance page gives it under Elemental
// Reactions (`{data-root}/cache/genshin-wiki/Page_Interruption_Resistance%2FData.json`): poiseDamage on the enemy a
// Reaction lands on, and reachPoiseDamage on each enemy it reaches. The page gives one figure for every reaction but
// Swirl, whose primary target takes 130 and each enemy it spreads to takes 30. Only Overloaded is blunt, the one
// Reaction the wiki's Blunt Attack list names (`{data-root}/cache/genshin-wiki/Page_Blunt_Attack.json`)
export const ReactionPoiseMap: Partial<Record<TransformativeReactionType, Except<ReactionPoise, "reactionType">>> = {
  [TransformativeReactionType.Bloom]: { isBlunt: false, poiseDamage: 25, reachPoiseDamage: 25 },
  [TransformativeReactionType.Burgeon]: { isBlunt: false, poiseDamage: 50, reachPoiseDamage: 50 },
  [TransformativeReactionType.Burning]: { isBlunt: false, poiseDamage: 30, reachPoiseDamage: 30 },
  [TransformativeReactionType.ElectroCharged]: { isBlunt: false, poiseDamage: 130, reachPoiseDamage: 130 },
  [TransformativeReactionType.Hyperbloom]: { isBlunt: false, poiseDamage: 50, reachPoiseDamage: 50 },
  [TransformativeReactionType.Overloaded]: { isBlunt: true, poiseDamage: 90, reachPoiseDamage: 90 },
  [TransformativeReactionType.Shattered]: { isBlunt: false, poiseDamage: 30, reachPoiseDamage: 30 },
  [TransformativeReactionType.Superconduct]: { isBlunt: false, poiseDamage: 30, reachPoiseDamage: 30 },
  [TransformativeReactionType.Swirl]: { isBlunt: false, poiseDamage: 130, reachPoiseDamage: 30 },
};
