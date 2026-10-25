import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";

// The piece a reliquary row is: its item id, the text id of its name, its rank, rarity and slot, and how many minor affixes
// It starts with, which a row that names none leaves at zero
export const toReliquaryPiece = ({
  appendPropNum,
  equipType,
  id,
  nameTextMapHash,
  rank,
  rankLevel,
}: ExcelReliquaryRow): {
  itemId: number;
  nameTextId: string;
  rank: number;
  rarity: number;
  slot: string;
  startingMinorCount: number;
} => ({
  itemId: id,
  nameTextId: String(nameTextMapHash),
  rank,
  rarity: rankLevel,
  slot: equipType,
  startingMinorCount: appendPropNum,
});
