// One of a character's constellations: the item it spends, the Stella Fortuna of its character, its name and
// Description by text id, its numbers, and the config the dump names it by, `<Name>_Constellation_<n>`, which holds
// The talent it raises, left out where it names none
export interface ExcelAvatarTalentRow {
  descTextMapHash: number;
  mainCostItemCount: number;
  mainCostItemId: number;
  nameTextMapHash: number;
  openConfig?: string;
  paramList: number[];
  talentId: number;
}
