import { LunarReactionType } from "genshin-world";

// The direct Lunar tags gcsim names in an `AttackInfo` literal, each the Lunar reaction its damage is dealt as. A hit
// Without one of these tags is none of the three, so it has no Lunar reaction
export const GcsimAttackTagLunarReactionTypeMap: Partial<Record<string, LunarReactionType>> = {
  "attacks.AttackTagDirectLunarBloom": LunarReactionType.LunarBloom,
  "attacks.AttackTagDirectLunarCharged": LunarReactionType.LunarCharged,
  "attacks.AttackTagDirectLunarCrystallize": LunarReactionType.LunarCrystallize,
};
