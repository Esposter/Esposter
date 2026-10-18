// An artifact's row of the game's reliquary table: its set, the slot it is worn in, its name's text id, its rank in its tab,
// Its rarity in stars, its highest level counting from +0 at one, the EXP its fodder is worth at base, its main affix's
// Depot, its minor affixes' depot, how many minor affixes it starts with and the levels one is added at
export interface ExcelReliquaryRow {
  addPropLevels: number[];
  appendPropDepotId: number;
  appendPropNum: number;
  baseConvExp: number;
  equipType: string;
  id: number;
  mainPropDepotId: number;
  maxLevel: number;
  nameTextMapHash: number;
  rank: number;
  rankLevel: number;
  setId: number;
}
