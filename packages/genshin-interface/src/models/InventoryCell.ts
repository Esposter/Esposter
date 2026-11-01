// An entry of the bag's grid: its id, its item's name in the reader's language, which a screen reader says in place of
// Its icon, its rarity in stars, its caption, the count of a stack or a weapon's or an artifact's level, whether the
// Bag's destroy mode may destroy it, whether it is a gadget the game lets the player equip to the quick-use slot,
// Whether the bag may use it and the most a Use takes where the use chooses an amount, whether it is an artifact the
// Bag may lock and whether it is locked, and whether it is ticked for a destroy
export interface InventoryCell {
  amountMaximum?: number;
  caption: string;
  id: string;
  isDestroyable: boolean;
  isEquipable: boolean;
  isLockable: boolean;
  isLocked: boolean;
  isSelected: boolean;
  isUsable: boolean;
  name: string;
  rarity: number;
}
