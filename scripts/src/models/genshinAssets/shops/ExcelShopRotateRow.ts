// One order of a rotation in the game's shop rotation table: the item the order gives, the rotation it belongs to and the
// Place it comes in within that rotation
export interface ExcelShopRotateRow {
  id: number;
  itemId: number;
  rotateId: number;
  rotateOrder: number;
}
