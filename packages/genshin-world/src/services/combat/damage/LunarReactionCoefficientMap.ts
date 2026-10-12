import { LunarReactionType } from "#src/models/combat/LunarReactionType";

// The factor each Lunar reaction's damage is multiplied by, as the Damage page of the Genshin Impact Wiki and gcsim's
// (MIT) pkg/enemy/damage.go give them. Lunar-Bloom deals no reaction damage of its own, only its direct hits'
// Https://genshin-impact.fandom.com/wiki/Damage#Lunar_and_Stellar_Glimmer_Reactions
export const LunarReactionCoefficientMap: Record<LunarReactionType, number> = {
  [LunarReactionType.LunarBloom]: 1,
  [LunarReactionType.LunarCharged]: 3,
  [LunarReactionType.LunarCrystallize]: 1.6,
};
