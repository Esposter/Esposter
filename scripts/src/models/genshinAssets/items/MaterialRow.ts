// The fields read off one row of the game's material table: its id, its type as the table spells it, the text id of its
// Name, its rank in its tab, its rarity in stars, how many of it one stack holds and the uses the item names when used
export interface MaterialRow {
  id: number;
  itemUse: { useOp: string; useParam: string[] }[];
  materialType: string;
  nameTextMapHash: number;
  rank: number;
  rankLevel: number;
  stackLimit: number;
}
