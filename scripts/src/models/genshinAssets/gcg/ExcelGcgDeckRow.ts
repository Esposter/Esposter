// One deck of the card game's deck table: the three characters it fields and the cards it holds, a card id once per copy
export interface ExcelGcgDeckRow {
  cardList: number[];
  characterList: number[];
  id: number;
}
