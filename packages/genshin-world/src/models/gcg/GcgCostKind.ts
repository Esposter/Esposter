// What a line of a skill's cost asks for: dice of one element, Matching dice of the character's own element, Unaligned
// Dice of any element, or the character's energy
export const GcgCostKind = { Dice: "Dice", Energy: "Energy", Matching: "Matching", Unaligned: "Unaligned" } as const;
export type GcgCostKind = (typeof GcgCostKind)[keyof typeof GcgCostKind];
