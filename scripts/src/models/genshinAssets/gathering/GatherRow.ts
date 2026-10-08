// The fields read off one row of the game's gather table: the item it gives, where it sits and how the game saves it
export interface GatherRow {
  itemId: number;
  pointLocation: string;
  saveType: string;
}
