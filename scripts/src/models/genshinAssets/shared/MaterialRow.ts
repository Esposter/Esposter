// The fields read off one row of the game's material table: its id, its type as the table spells it, which the dump
// Leaves out where the type is the table's first value, the text id of its name, its rank in its tab, its rarity in
// Stars, how many of it one stack holds, the quality a dish is by its food quality (which the dump leaves out for a
// Non-dish), the destroy rule the table gives it (which the dump leaves out where it gives none), the uses the item
// Names when used, and the target those uses act on, where it names one
export interface MaterialRow {
  destroyRule?: string;
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
