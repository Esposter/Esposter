// The kinds of recipe the bench holds: three of a material for one of the tier above, a potion from its ingredients, a
// Bait for fishing, Condensed Resin from Original Resin, a gadget from its instruction, such as a Resonance Stone, and a
// Conversion of one material into another with a catalyst
export enum CraftingRecipeKind {
  Bait = "Bait",
  Convert = "Convert",
  CondensedResin = "CondensedResin",
  Gadget = "Gadget",
  Potion = "Potion",
  Tier = "Tier",
}
