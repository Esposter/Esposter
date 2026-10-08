// The bag's tabs, each a kind of item the game files apart
export enum ItemCategory {
  Artifact = "Artifact",
  CharacterDevelopmentItem = "CharacterDevelopmentItem",
  Food = "Food",
  Furnishing = "Furnishing",
  Gadget = "Gadget",
  Material = "Material",
  PreciousItem = "PreciousItem",
  Quest = "Quest",
  Weapon = "Weapon",
}

// In the order the game shows them across the bag's head. It is written out, since lint sorts an enum's members and the
// Enum's own order is alphabetical
export const ItemCategories: readonly ItemCategory[] = [
  ItemCategory.Weapon,
  ItemCategory.Artifact,
  ItemCategory.CharacterDevelopmentItem,
  ItemCategory.Food,
  ItemCategory.Material,
  ItemCategory.Gadget,
  ItemCategory.Quest,
  ItemCategory.PreciousItem,
  ItemCategory.Furnishing,
];
