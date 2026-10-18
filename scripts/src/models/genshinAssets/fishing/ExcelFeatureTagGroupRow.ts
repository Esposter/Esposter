// One feature tag group of the game's tag table: the id a fish's monster is filed under, and the feature tags it holds,
// Padded with zeros to a fixed length
export interface ExcelFeatureTagGroupRow {
  groupID: number;
  tagIDs: number[];
}
