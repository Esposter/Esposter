// An entry of the bag's grid: its id, its item's name in the reader's language, which a screen reader says in place of
// Its icon, its rarity in stars, its caption, the count of a stack or a weapon's or an artifact's level, whether the
// Bag's destroy mode may destroy it, and whether it is ticked for a destroy
export interface InventoryCell {
  caption: string;
  id: string;
  isDestroyable?: true;
  isSelected?: true;
  name: string;
  rarity: number;
}
