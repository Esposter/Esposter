// An entry of the bag's grid: its id, its item's name in the reader's language, which a screen reader says in place of
// Its icon, its rarity in stars, and its caption, the count of a stack or a weapon's or an artifact's level
export interface InventoryCell {
  caption: string;
  id: number;
  name: string;
  rarity: number;
}
