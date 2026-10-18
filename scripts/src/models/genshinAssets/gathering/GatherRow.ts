// The fields read off one row of the game's gather table: the item it gives, where it sits and how the game saves it. The
// Dump leaves out a point location and a save type at their first values, so those two may be absent
export interface GatherRow {
  itemId: number;
  pointLocation?: string;
  saveType?: string;
}
