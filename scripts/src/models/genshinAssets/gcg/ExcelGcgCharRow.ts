// One character card of the card game's character table, as the dump names its fields. The fields the duel reads are
// Plain names; the obfuscated keys the dump also carries are not read
export interface ExcelGcgCharRow {
  hp: number;
  id: number;
  maxEnergy: number;
  skillList: number[];
  tagList: string[];
}
