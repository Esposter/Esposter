import type { ReliquaryPieceData } from "#src/models/reliquary/ReliquaryPieceData";

import { reliquaryPieceDataSchema } from "#src/models/reliquary/ReliquaryPieceData";
import { z } from "zod";

// One artifact set as the game's reliquary set table holds it: its id, the text id of its name, the counts of pieces its
// Bonuses take, the two-piece and the four-piece bonus, in the table's order, and each piece it is made of with its slot
export interface ReliquarySetData {
  id: number;
  nameTextId: string;
  needCounts: number[];
  pieces: ReliquaryPieceData[];
}

export const reliquarySetDataSchema = z.object({
  id: z.int().positive(),
  nameTextId: z.string().min(1),
  needCounts: z.array(z.int().positive()).min(1),
  pieces: z.array(reliquaryPieceDataSchema).min(1),
}) satisfies z.ZodType<ReliquarySetData>;
