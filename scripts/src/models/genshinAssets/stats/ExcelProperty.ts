// An attribute and its amount as the game's tables write one: the amount under the dump's obfuscated `GGKIEIJLCJJ`,
// Zero where the dump leaves it out, and the attribute left out where it is none, the first of its enum
export interface ExcelProperty {
  GGKIEIJLCJJ: number;
  propType?: string;
}
