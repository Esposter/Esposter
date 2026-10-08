import { ItemCategory } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// Each of the bag's tabs by the game's own name for it
export const ItemCategoryGameTextKeyMap = {
  [ItemCategory.Artifact]: GameTextKey.InventoryArtifacts,
  [ItemCategory.CharacterDevelopmentItem]: GameTextKey.InventoryCharacterDevelopmentItems,
  [ItemCategory.Food]: GameTextKey.InventoryFood,
  [ItemCategory.Furnishing]: GameTextKey.InventoryFurnishings,
  [ItemCategory.Gadget]: GameTextKey.InventoryGadget,
  [ItemCategory.Material]: GameTextKey.InventoryMaterials,
  [ItemCategory.PreciousItem]: GameTextKey.InventoryPreciousItems,
  [ItemCategory.Quest]: GameTextKey.InventoryQuest,
  [ItemCategory.Weapon]: GameTextKey.InventoryWeapons,
} as const satisfies Record<ItemCategory, GameTextKey>;
