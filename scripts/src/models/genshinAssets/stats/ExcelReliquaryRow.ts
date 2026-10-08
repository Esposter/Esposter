// An artifact's row of the game's reliquary table: its set, the slot it is worn in, its rarity in stars, its highest level
// Counting from +0 at one, the EXP its fodder is worth at base, its main affix's depot, its minor affixes' depot, how many
// Minor affixes it starts with and the levels one is added at
export interface ExcelReliquaryRow {
  addPropLevels: number[];
  appendPropDepotId: number;
  appendPropNum: number;
  baseConvExp: number;
  equipType: string;
  id: number;
  mainPropDepotId: number;
  maxLevel: number;
  rankLevel: number;
  setId: number;
}
