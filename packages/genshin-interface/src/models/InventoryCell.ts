// An entry of the bag's grid: its id, its item's name in the reader's language, which a screen reader says in place of
// Its icon, its rarity in stars, its caption, the count of a stack or a weapon's or an artifact's level, whether the
// Bag's destroy mode may destroy it, whether it is a gadget the game lets the player equip to the quick-use slot,
// Whether the bag may use it, whether it is an artifact the bag may lock and whether it is locked, and whether it is ticked
// For a destroy
export interface InventoryCell {
  caption: string;
  id: string;
  isDestroyable?: true;
  isEquipable?: true;
  isLockable?: true;
  isLocked?: true;
  isSelected?: true;
  isUsable?: true;
  name: string;
  rarity: number;
}
