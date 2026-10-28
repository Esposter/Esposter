// The fields read off one row of the game's gather table: the item it gives, where it sits, the gather point type it is
// Marked under and how the game saves it. The dump leaves out a point location and a save type at their first values, so
// Those two may be absent
export interface GatherRow {
  itemId: number;
  pointLocation?: string;
  pointType: number;
  saveType?: string;
}
