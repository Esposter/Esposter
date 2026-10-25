import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";
import type { ReliquaryPieceData } from "genshin-world";

import { ArtifactSlot } from "genshin-world";
import { z } from "zod";

// The piece a reliquary row is: its item id, the text id of its name, its rank, rarity and slot, and how many minor affixes
// It starts with, which a row that names none leaves at zero
export const toReliquaryPiece = ({
  appendPropNum,
  equipType,
  id,
  nameTextMapHash,
  rank,
  rankLevel,
}: ExcelReliquaryRow): ReliquaryPieceData => ({
  itemId: id,
  nameTextId: String(nameTextMapHash),
  rank,
  rarity: rankLevel,
  slot: z.enum(ArtifactSlot).parse(equipType),
  startingMinorCount: appendPropNum,
});
