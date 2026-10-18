// The week reward the card game's week table pays at one Genius Invokation level. The item list is read under the dump's
// Scrambled key, and each item's count is under the dump's scrambled `NIEOALBMDMB` key, the count the Lucky Coins and
// Player EXP values were read from; the dump does not label that count, so its meaning stays the dump's
export interface ExcelGcgWeekRewardItem {
  itemId: number;
  NIEOALBMDMB: number;
}

export interface ExcelGcgWeekRewardRow {
  gcgLevel: number;
  items: ExcelGcgWeekRewardItem[];
}
