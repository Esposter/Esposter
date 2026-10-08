import { InventorySort } from "#src/models/InventorySort";
import { ItemCategory } from "#src/models/ItemCategory";

// The weapons' tab holding a sword and a bow, sorted by level from the highest, and the Materials tab's two stacks
export const props = {
  backLabel: "Back",
  capacity: "Weapons 2/2000",
  category: ItemCategory.Weapon,
  cells: [
    { caption: "Lv. 1", id: "0", name: "Dull Blade", rarity: 1 },
    { caption: "Lv. 1", id: "1", name: "Hunter's Bow", rarity: 1 },
  ],
  currencies: [{ id: "Mora", name: "Mora", quantity: 0 }],
  isDescending: true,
  isSortable: true,
  orderLabel: "Descending",
  selectedId: "0",
  sort: InventorySort.Level,
  sortLabels: { [InventorySort.Level]: "Level", [InventorySort.Quality]: "Quality" },
  tabLabels: {
    [ItemCategory.Artifact]: "Artifacts",
    [ItemCategory.CharacterDevelopmentItem]: "Character Development Items",
    [ItemCategory.Food]: "Food",
    [ItemCategory.Furnishing]: "Furnishings",
    [ItemCategory.Gadget]: "Gadget",
    [ItemCategory.Material]: "Materials",
    [ItemCategory.PreciousItem]: "Precious Items",
    [ItemCategory.Quest]: "Quest",
    [ItemCategory.Weapon]: "Weapons",
  },
  title: "Inventory",
};
export const variants = {
  materials: {
    capacity: "",
    category: ItemCategory.Material,
    cells: [
      { caption: "3", id: "2", name: "Sweet Flower", rarity: 1 },
      { caption: "1", id: "3", name: "Windwheel Aster", rarity: 1 },
    ],
    isSortable: undefined,
  },
};
