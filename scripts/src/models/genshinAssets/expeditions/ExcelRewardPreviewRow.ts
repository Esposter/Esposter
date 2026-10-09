// One reward preview of the game's table: the items it gives, each with its id and its count, which is one number or a
// Range of two joined by a semicolon that a claim draws its count from. An empty slot's id is zero
export interface ExcelRewardPreviewRow {
  id: number;
  previewItems: { count: string; id: number }[];
}
