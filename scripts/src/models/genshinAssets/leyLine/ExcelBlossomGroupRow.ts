// One place a ley line outcrop can stand, in the game's blossom group table: the section it belongs to and the places
// It moves to next
export interface ExcelBlossomGroupRow {
  cityId: number;
  id: number;
  nextCampIdVec: number[];
  sectionId: number;
}
