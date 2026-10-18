// The fields read off one row of the game's material table: its id, its type as the table spells it, which the dump leaves
// Out where the type is the table's first value, the text id of its name, its rank in its tab, its rarity in stars, how
// Many of it one stack holds, the quality a dish is by its food quality (which the dump leaves out for a non-dish), the
// uses the item names when used, and the
// Target those uses act on, where it names one
export interface MaterialRow {
  foodQuality?: string;
  id: number;
  itemUse: { useOp: string; useParam: string[] }[];
  materialType?: string;
  nameTextMapHash: number;
  rank: number;
  rankLevel: number;
  stackLimit: number;
  useTarget?: string;
}
