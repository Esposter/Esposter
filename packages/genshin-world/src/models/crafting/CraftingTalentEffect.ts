// The kinds of crafting talent a character's passive gives the bench: a chance of a second result, a chance of one of the
// Recipe's first material back, or a chance of one regional talent material beside a talent book
export const CraftingTalentEffect = {
  DoubleProduct: "DoubleProduct",
  Refund: "Refund",
  RegionalTalentMaterial: "RegionalTalentMaterial",
} as const;
export type CraftingTalentEffect = (typeof CraftingTalentEffect)[keyof typeof CraftingTalentEffect];
