import { InventorySort } from "#src/models/InventorySort";
import { ItemCategory } from "#src/models/ItemCategory";

// The weapons' tab holding a sword and a bow, sorted by level from the highest, and the Materials tab's two stacks. The
// Destroy mode's words are the game's, and its states are the variants
export const props = {
  backLabel: "Back",
  cancelLabel: "Cancel",
  capacity: "Weapons 2/2000",
  category: ItemCategory.Weapon,
  cells: [
    { caption: "Lv. 1", id: "0", name: "Dull Blade", rarity: 1 },
    { caption: "Lv. 1", id: "1", name: "Hunter's Bow", rarity: 1 },
  ],
  currencies: [{ id: "Mora", name: "Mora", quantity: 0 }],
  destroyButtonLabel: "Destroy",
  destroyCannotLabel: "This item cannot be destroyed",
  destroyConfirmButtonLabel: "OK",
  destroyConfirmListLabel: "The following items will be destroyed:",
  destroyConfirmTitle: "Destroy Items",
  destroyConfirmWarningLabel: "The item(s) will be destroyed. This action cannot be undone.",
  destroyLabel: "Destroy",
  destroyNames: [],
  destroyRecoveredLabel: "Recovered:",
  destroyRecoveredNames: [],
  destroySelectedLabel: "0/2 selected",
  destroyTipLabel: "Select items to destroy",
  isDescending: true,
  isSortable: true,
  orderLabel: "Descending",
  quickSelects: [
    { label: "1-Star Weapons", rarity: 1 },
    { label: "2-Star Weapons", rarity: 2 },
    { label: "3-Star Weapons", rarity: 3 },
  ],
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
// The two weapons chosen for a destroy, the first one ticked, with the count the game's own line fills
const destroyingCells = [
  { caption: "Lv. 1", id: "0", isDestroyable: true, isSelected: true, name: "Dull Blade", rarity: 1 },
  { caption: "Lv. 1", id: "1", isDestroyable: true, name: "Hunter's Bow", rarity: 1 },
];
export const variants = {
  confirming: {
    cells: destroyingCells,
    destroyNames: ["Dull Blade"],
    destroyRecoveredNames: ["Enhancement Ore x3"],
    destroySelectedLabel: "1/2 selected",
    isConfirming: true,
    isDestroying: true,
  },
  destroying: {
    cells: destroyingCells,
    destroyNames: ["Dull Blade"],
    destroySelectedLabel: "1/2 selected",
    isDestroying: true,
  },
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
