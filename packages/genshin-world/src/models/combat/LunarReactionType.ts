// The reactions a Moonsign character's Benediction turns its party's own into, whose damage is Lunar: Bloom becomes
// Lunar-Bloom, Electro-Charged Lunar-Charged, and the Crystallize of Hydro Lunar-Crystallize
export const LunarReactionType = {
  LunarBloom: "LunarBloom",
  LunarCharged: "LunarCharged",
  LunarCrystallize: "LunarCrystallize",
} as const;
export type LunarReactionType = (typeof LunarReactionType)[keyof typeof LunarReactionType];
