// The kinds of recipe the blacksmith forges: an enhancement ore, which counts toward the day's cap of forge points, and a
// Four-star weapon, forged from its region's billet, which counts none
export const ForgeRecipeKind = { Enhancement: "Enhancement", Weapon: "Weapon" } as const;
export type ForgeRecipeKind = (typeof ForgeRecipeKind)[keyof typeof ForgeRecipeKind];
