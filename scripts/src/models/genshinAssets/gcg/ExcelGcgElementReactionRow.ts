// One elemental reaction of the card game: the two element types it pairs and the id a rule lists it by. Its skill row
// Names the reaction's effect in the skill table, which the duel reads by the element pair rather than by that row
export interface ExcelGcgElementReactionRow {
  elementType1: string;
  elementType2: string;
  id: number;
}
